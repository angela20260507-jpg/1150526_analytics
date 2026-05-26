import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Copy, 
  Check, 
  RotateCw, 
  Download, 
  Sparkles, 
  FileCheck, 
  Clock, 
  Activity 
} from "lucide-react";

interface ResultViewProps {
  summary: string;
  isLoading: boolean;
  onRegenerate?: () => void;
  langRequest?: string;
  provider?: string;
}

const LOADING_STEPS = [
  "正在解析會議原始逐字稿語境與語音斷句...",
  "正在過濾口水話、口頭禪與無效率閒聊...",
  "正在辨識多種指代關係（誰提到了什麼、承諾了哪項工作）...",
  "正在深入分組，按議題主題結構化會議摘要...",
  "正在精準捕捉待辦項目，提取明確負責人與對應截止時程...",
  "正在依照設定的語氣細調文章流暢度...",
  "正在將核心提鍊與代辦事項轉換翻譯為目標語系..."
];

export default function ResultView({ summary, isLoading, onRegenerate, langRequest, provider }: ResultViewProps) {
  const [copied, setCopied] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Loading Steps 輪播
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // 複製剪貼簿
  const handleCopy = async () => {
    if (!summary) return;
    let success = false;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        success = true;
      }
    } catch (err) {
      console.warn("Clipboard API failed, trying fallback...", err);
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = summary;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 下載為 Markdown 檔案
  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `會議紀錄與翻譯成果_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="result-view-container" className="flex flex-col gap-6">
      {/* 狀態一：AI 刻正處理中 (Loading) */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin flex items-center justify-center"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 text-center animate-pulse font-sans">
            AI 祕書正在全力產出會議記錄
          </h3>
          <p className="text-sm text-slate-500 mt-2 text-center max-w-md font-sans">
            這大約需要 15 到 30 秒，幾何編排引擎正在重構會議的底層結構。
          </p>

          {/* 生動的步驟日誌 */}
          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 w-full max-w-lg">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-3">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>實時分析幾何管線狀態</span>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 animate-bounce" />
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-700 transition-all duration-350">
                  {LOADING_STEPS[stepIndex]}
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${((stepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 狀態二：顯示生成結果 */}
      {!isLoading && summary && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {/* 結果頂欄操作區 */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">輸出狀態：成功編撰</span>
                <h4 className="text-sm font-bold text-slate-800">AI 幾何對稱結構化會議成果</h4>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded border transition-all cursor-pointer ${
                  copied
                    ? "bg-emerald-50 border-emerald-250 text-emerald-700 font-bold"
                    : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>複製成功</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>一鍵複製</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>儲存成 .md檔</span>
              </button>
            </div>
          </div>

          {/* 渲染區塊 */}
          <div id="markdown-result-area" className="p-6 md:p-8 bg-white selection:bg-blue-100/80">
            <ReactMarkdown
              components={{
                h1: (props) => (
                  <h1 className="text-xl font-bold text-blue-600 border-b border-slate-200 pb-3 mb-6 mt-4 flex items-center gap-2" {...props} />
                ),
                h2: (props) => (
                  <h2 className="text-base font-extrabold text-slate-850 pb-1 mb-4 mt-8 border-l-4 border-blue-600 pl-3 leading-snug" {...props} />
                ),
                h3: (props) => (
                  <h3 className="text-sm font-bold text-slate-805 mb-2 mt-5" {...props} />
                ),
                p: (props) => (
                  <p className="text-sm text-slate-650 leading-relaxed mb-4" {...props} />
                ),
                ul: (props) => (
                  <ul className="list-none pl-1 mb-5 space-y-2 text-sm text-slate-600" {...props} />
                ),
                ol: (props) => (
                  <ol className="list-decimal pl-6 mb-5 space-y-2 text-sm text-slate-600" {...props} />
                ),
                li: (props) => {
                  const content = props.children ? String(props.children) : "";
                  // 支持將 🔲 / [ ] 轉換為美美的待辦 UI
                  if (content.includes("🔲") || content.includes("[x]") || content.includes("[ ]")) {
                    return (
                      <li className="flex items-start gap-2.5 bg-blue-50/40 border border-blue-100 rounded-lg p-3 text-slate-700 hover:bg-blue-50/70 transition-colors" {...props} />
                    );
                  }
                  return (
                    <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-blue-500 before:font-bold text-slate-650" {...props} />
                  );
                },
                strong: (props) => (
                  <strong className="font-bold text-slate-800 bg-slate-50 px-1 py-0.5 rounded border border-slate-200 font-semibold" {...props} />
                ),
                hr: () => (
                  <hr className="my-7 border-dashed border-slate-250" />
                ),
                blockquote: (props) => (
                  <blockquote className="border-l-4 border-slate-300 pl-4 py-2 text-slate-550 bg-slate-50/60 rounded italic my-5 text-xs inline-block w-full" {...props} />
                ),
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>

          {/* 底部小提示 */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-[10px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>使用 {provider === "nvidia" ? "NVIDIA" : "Google Gemini"} 專業摘要核心，生成格式支援標誌性的美化 Markdown 幾何列表。</span>
            <span>本次翻譯成果語系設定: <strong className="text-blue-600 font-bold">{langRequest || "不翻譯"}</strong></span>
          </div>
        </div>
      )}

      {/* 狀態三：未生成前預設畫面 */}
      {!isLoading && !summary && (
        <div className="bg-slate-50 border border-slate-300 border-dashed rounded-xl p-8 py-16 flex flex-col items-center justify-center min-h-[360px] shadow-inner">
          <div className="p-4 bg-white rounded-lg shadow-xs border border-slate-200 text-blue-600 mb-4 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 text-center uppercase tracking-wider">
            等待您的會議記錄填入與生成
          </h3>
          <p className="text-xs text-slate-450 mt-2 text-center max-w-sm leading-relaxed">
            在左側/上方貼好您的會議記錄或逐字稿，設定想要的輸出語調後點選 **「生成總結與翻譯」**。AI 將以精準、高邏輯的幾何佈局為您呈現最專業的會議產出。
          </p>
        </div>
      )}
    </div>
  );
}
