import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy init the Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("系統未檢測到 GEMINI_API_KEY。請在 AI Studio 中經由 Settings > Secrets 設定。");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// 系統核心 System Instructions 
const SYSTEM_INSTRUCTIONS = `
你是一位專業的會議記錄助理。請根據使用者提供的會議逐字稿，整理出結構化的會議紀錄。
請務必遵守以下輸出格式要求：

1. **會議主題與時間**：擷取會議的主題與時間。
2. **與會者**：列出參與會議的人員。
3. **會議重點總結**：用 3 到 5 個重點總結會議內容。
4. **Action Items (待辦事項)**：明確列出接下來的待辦事項與負責人。
5. **英文翻譯版**：將上述 1~4 點的內容完整翻譯成專業的英文。

請以 Markdown 格式輸出，所有繁體中文部分必須使用**繁體中文**回覆，不要包含任何額外的問候語或結語。
`;

// API route 
app.post("/api/generate-summary", async (req, res) => {
  try {
    const { transcript, translateLang, summaryTone, customInstructions } = req.body;

    if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
      return res.status(400).json({ success: false, error: "會議逐字稿內容不能為空" });
    }

    const ai = getGeminiClient();

    // 建立 User prompt，結合用戶的自訂要求與參數
    let userPrompt = `【待處理的會議逐字稿/筆記內容】:\n"""\n${transcript}\n"""\n\n`;
    userPrompt += `【設定參數】:\n`;
    userPrompt += `- **目標翻譯語言**: ${translateLang ? translateLang : "不翻譯"}\n`;
    userPrompt += `- **輸出語調風格**: ${summaryTone ? summaryTone : "詳細專業"}\n`;
    if (customInstructions && customInstructions.trim() !== "") {
      userPrompt += `- **額外自訂吩咐**: ${customInstructions}\n`;
    }

    userPrompt += `\n請你根據以上的參數設定與自訂指示，對逐字稿進行分析與摘要。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        temperature: 0.25, // 低隨機性，維持摘要精確與格式結構
      }
    });

    const summaryText = response.text;
    res.json({ success: true, summary: summaryText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ success: false, error: error.message || "處理會議記錄時發生未知錯誤" });
  }
});

// Vite middleware setup
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
