import { useState, useTransition } from "react";
import { 
  BookOpen, 
  Trash2, 
  Settings, 
  HelpCircle, 
  FileSignature, 
  Sparkles, 
  Languages, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { 
  TONE_OPTIONS, 
  LANGUAGE_OPTIONS, 
  TRANSCRIPT_PRESETS,
  type GenerateSummaryRequest
} from "../types.ts";

interface MeetingInputProps {
  onSubmit: (data: GenerateSummaryRequest) => void;
  isLoading: boolean;
}

export default function MeetingInput({ onSubmit, isLoading }: MeetingInputProps) {
  const [transcript, setTranscript] = useState("");
  const [translateLang, setTranslateLang] = useState("不翻譯");
  const [summaryTone, setSummaryTone] = useState("detailed");
  const [customInstructions, setCustomInstructions] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [provider, setProvider] = useState("gemini");

  // 一鍵載入範例
  const handleLoadPreset = (presetIndex: number) => {
    const p = TRANSCRIPT_PRESETS[presetIndex];
    if (p) {
      setTranscript(p.content);
      setTranslateLang(p.translateLang);
      setSummaryTone(p.summaryTone);
      setCustomInstructions(p.customInstructions);
      setProvider("gemini");
    }
  };

  const handleClear = () => {
    setTranscript("");
    setCustomInstructions("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    onSubmit({
      transcript,
      translateLang,
      summaryTone,
      customInstructions,
      provider
    });
  };

  const charCount = transcript.length;

  return (
    <form id="meeting-input-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 範例貼上一鍵載入區 */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-inner">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>快速測試：載入會議逐字稿範本</span>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>什麼是逐字稿？</span>
          </button>
        </div>

        {showHelp && (
          <div className="text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-lg p-3.5 mb-3.5 leading-relaxed">
            會議逐字稿是指會議中每個人發言的原文記錄。AI 能夠在毫無章法、帶有口語或打斷的閒聊廢話對話中，精準過濾口水話、將混亂的溝通內容梳理成邏輯嚴密的決議、待辦事項和重點綱要，即使多人同時發言、甚至提到非結構化時程，都能迎刃而解！
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRANSCRIPT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadPreset(idx)}
              className="text-left bg-white border border-slate-200 hover:border-blue-500 rounded-lg p-3.5 hover:shadow-xs transition-all duration-200 group cursor-pointer"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {p.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {p.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 uppercase font-mono">
                  原語
                </span>
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  → 譯為 {p.translateLang}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 核心輸入區 */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="transcript-textarea" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-blue-600" />
              <span>輸入區域 | 會議逐字稿或筆記</span>
            </label>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-850 font-bold px-2 py-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空重填</span>
              </button>
            )}
          </div>
          
          <div className="relative mt-1">
            <textarea
              id="transcript-textarea"
              rows={12}
              required
              className="w-full bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y min-h-[220px] shadow-inner font-sans leading-relaxed"
              placeholder="請在此貼上您的會議影片/音檔轉出的逐字稿、混亂的對話記錄或簡短的大綱筆記。
範例：
陳經理：大家早，今天討論明年 Q1 的產品路線圖...
林工：目前的瓶頸在於快取機制..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <div className="absolute bottom-3 right-4 flex items-center gap-2 text-[10px] bg-slate-50 border border-slate-250 rounded-md px-2 py-0.5 text-slate-400 font-mono">
              <span>{charCount.toLocaleString()} 字</span>
            </div>
          </div>
        </div>

        {/* 進階 AI 參數配置 */}
        <div className="border-t border-slate-200 pt-5">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider mb-4">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>智能摘要設定與翻譯選項</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* AI 服務提供商 */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="provider-select" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>AI 服務提供商</span>
              </label>
              <select
                id="provider-select"
                className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-xs font-bold"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="gemini">Google Gemini (gemini-3.5-flash)</option>
                <option value="nvidia">NVIDIA (nvidia/nemotron-mini-4b-instruct)</option>
              </select>
            </div>

            {/* 總結風格 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="summary-tone-select" className="text-xs font-bold text-slate-600">
                會議記錄輸出語調與深度
              </label>
              <select
                id="summary-tone-select"
                className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-xs"
                value={summaryTone}
                onChange={(e) => setSummaryTone(e.target.value)}
              >
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 目標翻譯語系 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="translate-lang-select" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-slate-450" />
                <span>附帶目標翻譯成果 (多語同步)</span>
              </label>
              <select
                id="translate-lang-select"
                className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-xs"
                value={translateLang}
                onChange={(e) => setTranslateLang(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 額外吩咐 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="custom-instructions-input" className="text-xs font-bold text-slate-600">
              給 AI 的特別指示 / 補充背景 (選填)
            </label>
            <input
              id="custom-instructions-input"
              type="text"
              className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
              placeholder="例如：「請特別強調行政組提出的差旅補助方案」、「整理一格決策對比矩陣」..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* 生成按鈕 */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-slate-350 shrink-0" />
            <span>基於安全考量，所有敏感 API 金鑰均經過隱密伺服器代理解析</span>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-bold shadow-md transition-all duration-300 select-none ${
              !transcript.trim() 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                : isLoading 
                ? "bg-blue-400 text-white cursor-not-allowed shadow-none" 
                : "bg-blue-600 border border-blue-700 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 active:scale-98 cursor-pointer"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>AI 正在研讀與整理中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
                <span>生成總結與翻譯</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
