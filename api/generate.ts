import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { transcript, translateLang, summaryTone, customInstructions, provider } = req.body;

    if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
      return res.status(400).json({ success: false, error: "會議逐字稿內容不能為空" });
    }

    let userPrompt = `【待處理的會議逐字稿/筆記內容】:\n"""\n${transcript}\n"""\n\n`;
    userPrompt += `【設定參數】:\n`;
    userPrompt += `- **目標翻譯語言**: ${translateLang ? translateLang : "不翻譯"}\n`;
    userPrompt += `- **輸出語調風格**: ${summaryTone ? summaryTone : "詳細專業"}\n`;
    if (customInstructions && customInstructions.trim() !== "") {
      userPrompt += `- **額外自訂吩咐**: ${customInstructions}\n`;
    }
    userPrompt += `\n請你根據以上的參數設定與自訂指示，對逐字稿進行分析與摘要。`;

    let summaryText = "";

    if (provider === "nvidia") {
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          success: false, 
          error: "系統未檢測到 NVIDIA_API_KEY。請確認環境變數設定。" 
        });
      }

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-mini-4b-instruct",
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTIONS },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.25
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`NVIDIA API 回傳錯誤: ${response.status} ${response.statusText} - ${errText}`);
      }

      const data = await response.json();
      summaryText = data.choices?.[0]?.message?.content || "";
    } else {
      // Default to gemini (gemini-3.5-flash)
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          success: false, 
          error: "系統未檢測到 GEMINI_API_KEY。請確認環境變數設定。" 
        });
      }

      const aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          temperature: 0.25,
        }
      });

      summaryText = response.text || "";
    }

    if (!summaryText) {
      throw new Error("AI 回傳了空值。");
    }

    return res.status(200).json({ success: true, summary: summaryText });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "處理會議記錄時發生未知錯誤" 
    });
  }
}
