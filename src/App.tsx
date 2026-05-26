import { useState } from "react";
import Header from "./components/Header.tsx";
import MeetingInput from "./components/MeetingInput.tsx";
import ResultView from "./components/ResultView.tsx";
import { type GenerateSummaryRequest } from "./types.ts";
import { AlertTriangle, HelpCircle, ArrowRight, Github } from "lucide-react";

export default function App() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState("");

  const handleGenerateSummary = async (formData: GenerateSummaryRequest) => {
    setIsLoading(true);
    setError(null);
    setActiveLang(formData.translateLang);

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMsg = "連線後端伺服器時發生異常。";
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
      } else {
        throw new Error(data.error || "AI 回傳了空值或未知的處理錯誤。");
      }
    } catch (err: any) {
      console.error("生成會議記錄出錯:", err);
      setError(err.message || "處理並生成會議記錄時出錯，嘗試重新設定或稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 py-8 px-4 sm:px-6 lg:px-8 flex flex-col font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col gap-8 w-full">
        {/* 精緻標題 */}
        <Header />

        {/* 錯誤反饋橫幅 */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-3 animate-fade-in shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-900">產出會議記錄時遭遇阻礙</h4>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">{error}</p>
              <div className="mt-3 text-xs bg-white border border-rose-100 rounded p-2.5 text-slate-550/90 leading-relaxed">
                <span className="font-bold block text-slate-800 mb-1">🔍 優先自我檢測方案：</span>
                1. 請檢查您的 Google Gemini API Key 是否正確設定（在 **Settings &gt; Secrets** 面板中）。<br />
                2. 確認您的 API Key 已設置，而後點擊生成大按鈕即可。
              </div>
            </div>
          </div>
        )}

        {/* 核心工作主介面 (Desktop 二分屏 layout, Mobile 單欄向下流) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 左側：控制輸入 */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <MeetingInput onSubmit={handleGenerateSummary} isLoading={isLoading} />
          </div>

          {/* 右側：成果展示與追蹤 */}
          <div className="lg:col-span-7 lg:sticky lg:top-6">
            <ResultView 
              summary={summary} 
              isLoading={isLoading} 
              langRequest={activeLang}
            />
          </div>
        </div>
      </div>

      {/* 底部 Footer - 高度重現 Geometric Balance 對稱設計 */}
      <footer className="max-w-7xl mx-auto w-full mt-16 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-sans tracking-wider uppercase font-semibold">
        <div>系統指示詞：繁體中文精密分析 / 多語商務翻譯模式</div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>系統狀態：正常 (Port 3000)</span>
          </span>
          <span>模型: Gemini 3.5 Flash</span>
          <span>版本: v2.5.0</span>
        </div>
      </footer>
    </div>
  );
}
