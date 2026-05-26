import { Sparkles, FileText, Languages, ClipboardCheck } from "lucide-react";

export default function Header() {
  return (
    <div id="app-header" className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-xs relative overflow-hidden transition-all duration-300">
      {/* 幾何點綴背景 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-50 border-r border-t border-slate-200/50 rounded-tr-xl pointer-events-none"></div>

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          {/* 幾何徽章 */}
          <div className="inline-flex items-center gap-2 bg-blue-55 border border-blue-100 rounded px-3 py-1 text-xs font-bold text-blue-600 mb-3.5 tracking-wider uppercase">
            <div className="w-2 h-2 bg-blue-600 rotate-45 shrink-0 spin-fast"></div>
            <span>GEOMETRIC BALANCE · 智能會議大腦</span>
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            {/* 旋轉幾何 Logo 物件 */}
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-100">
              <div className="w-4.5 h-4.5 border-2 border-white rotate-45 transition-all group-hover:rotate-90"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                智議 AI <span className="text-blue-600 font-medium">| 會議記錄與多語翻譯</span>
              </h1>
            </div>
          </div>
          
          <p className="mt-3 text-sm text-slate-500 max-w-3xl leading-relaxed">
            採用極度對稱、功能導向的 Geometric Balance 幾何平衡版面。
            整合 Google Gemini 尖端語言模型，能快速研讀複雜的對話逐字稿，為您提煉關鍵議題、歸納具體決議，並完美自動提取待辦事項及翻譯成跨境商務語言。
          </p>
        </div>

        {/* 幾何卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">研讀摘要</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">自動議題分類</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">追蹤落地</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">精確待辦指派</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">跨境協同</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">商務雙語譯本</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
