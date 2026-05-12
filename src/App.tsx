import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCcw, 
  CheckCircle2, 
  HelpCircle, 
  XOctagon,
  ArrowRight,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ensure the data has a unique ID and tracking fields
type CardStatus = 'familiar' | 'unfamiliar' | 'unknown' | null;

interface CardData {
  id: string;
  acronym: string;
  english: string;
  chinese: string;
  status: CardStatus;
}

const RAW_DATA = [
  { acronym: "MC", english: "Mass customization", chinese: "大规模定制" },
  { acronym: "MTS", english: "Make-to-stock", chinese: "存货型生产" },
  { acronym: "MTO", english: "Make-to-order", chinese: "订货型生产" },
  { acronym: "ATO", english: "Assemble-to-order", chinese: "按单装配" },
  { acronym: "MTO", english: "Manufacture-to-order", chinese: "按单制造" },
  { acronym: "ETO", english: "Engineering-to-order", chinese: "按单设计" },
  { acronym: "MRP", english: "Material Requirements Planning", chinese: "物料需求计划" },
  { acronym: "MRPII", english: "Manufacturing Resource Planning", chinese: "制造资源计划" },
  { acronym: "ERP", english: "Enterprise Resource Planning", chinese: "企业资源计划" },
  { acronym: "CIMS", english: "Computer Integrated Manufacturing System", chinese: "计算机集成制造" },
  { acronym: "TOC", english: "Theory of Constraints", chinese: "约束理论" },
  { acronym: "SWOT", english: "Strengths, Weaknesses, Opportunities, Threats", chinese: "优势、劣势、机会、威胁" },
  { acronym: "PPM", english: "Product-Process Matrix", chinese: "产品-生产过程矩阵" },
  { acronym: "FMS", english: "Flexible Manufacturing System", chinese: "柔性制造系统" },
  { acronym: "CRM", english: "Customer Relationship Management", chinese: "客户关系管理" },
  { acronym: "DRP", english: "Distribution Requirement Planning", chinese: "分销需求计划" },
  { acronym: "MBD", english: "Model-Based Definition", chinese: "基于模型的设计" },
  { acronym: "VPD", english: "Virtual Product Development", chinese: "拟实产品开发" },
  { acronym: "DOE", english: "Design of Experiments", chinese: "实验设计" },
  { acronym: "VOC", english: "Voice of Customer", chinese: "顾客的声音" },
  { acronym: "QFD", english: "Quality Function Deployment", chinese: "质量功能展开" },
  { acronym: "RE", english: "Reverse Engineering", chinese: "逆向工程（反求工程）" },
  { acronym: "VE", english: "Value Engineering", chinese: "价值工程" },
  { acronym: "GT", english: "Group Technology", chinese: "成组技术" },
  { acronym: "DFx", english: "Design for X", chinese: "面向 X 的设计过程" },
  { acronym: "CAx", english: "Computer Aided X", chinese: "计算机辅助技术" },
  { acronym: "CAPP", english: "Computer Aided Process Planning", chinese: "计算机辅助工艺过程设计" },
  { acronym: "BOM", english: "Bill of Material", chinese: "物料清单" },
  { acronym: "PDM", english: "Product Data Management", chinese: "产品数据管理" },
  { acronym: "PLM", english: "Product Lifecycle Management", chinese: "产品生命周期管理" },
  { acronym: "CE", english: "Concurrent Engineering", chinese: "并行工程" },
  { acronym: "S&OP", english: "Sales and Operation Planning", chinese: "销售与运作计划" },
  { acronym: "WIP", english: "Work in process", chinese: "在制品" },
  { acronym: "EOQ", english: "Economic Order Quantity", chinese: "经济订货批量" },
  { acronym: "EPQ", english: "Economic Production Quantity", chinese: "经济生产批量" },
  { acronym: "EOI", english: "Economic Order Interval", chinese: "经济订货间隔期" },
  { acronym: "GR", english: "Gross Requirement", chinese: "毛需求量" },
  { acronym: "SR", english: "Scheduled Receipt", chinese: "计划接收量" },
  { acronym: "PAB", english: "Projected Available Balance", chinese: "预计可用库存量" },
  { acronym: "NR", english: "Net Requirement", chinese: "净需求量" },
  { acronym: "PORC", english: "Planned Order Receipt", chinese: "计划产出量" },
  { acronym: "PORI", english: "Planned Order Release", chinese: "计划投入量" },
  { acronym: "ATP", english: "Available To Promise", chinese: "可供销售量" },
  { acronym: "LT", english: "Lead Time", chinese: "提前期" },
  { acronym: "SS", english: "Safety Stock", chinese: "安全库存" },
  { acronym: "EPP", english: "Economic Part Period", chinese: "经济件期数" },
  { acronym: "RCCP", english: "Rough-cut Capacity Planning", chinese: "粗能力计划" },
  { acronym: "CRP", english: "Capacity Requirements Planning", chinese: "细能力计划" },
  { acronym: "RRP", english: "Resource Requirements Planning", chinese: "资源需求计划" },
  { acronym: "LCFS", english: "Last Come First Served", chinese: "后到先服务" },
  { acronym: "SPT", english: "Shortest Processing Time", chinese: "最短作业时间规则" },
  { acronym: "EDD", english: "Earliest Due Date", chinese: "最早交货期规则" },
  { acronym: "STR", english: "Slack Time Remaining", chinese: "剩余松弛时间规则" }
];

const INITIAL_CARDS: CardData[] = RAW_DATA.map((item, index) => ({
  ...item,
  id: `card_${index}`,
  status: null,
}));

// Fisher-Yates Shuffle
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function App() {
  const [cards, setCards] = useState<CardData[]>(INITIAL_CARDS);
  const [queue, setQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // Randomly test En->Zh or Zh->En
  const [testDirection, setTestDirection] = useState<'to-en' | 'to-zh'>('to-zh');
  
  const [view, setView] = useState<'home' | 'study' | 'summary'>('home');

  const startSession = (specificIds?: string[]) => {
    let idsToStudy = specificIds;
    if (!idsToStudy) {
      idsToStudy = cards.map(c => c.id);
    }
    
    if (idsToStudy.length === 0) return;

    setQueue(shuffle(idsToStudy));
    setCurrentIndex(0);
    setIsFlipped(false);
    setTestDirection(Math.random() > 0.5 ? 'to-zh' : 'to-en');
    setView('study');
  };

  const handleStatusUpdate = (status: CardStatus) => {
    const currentCardId = queue[currentIndex];
    
    // Update card status
    setCards(prev => prev.map(c => 
      c.id === currentCardId ? { ...c, status } : c
    ));

    // If 'unknown', push it back into the queue for spaced repetition within the session
    const isUnknown = status === 'unknown';
    
    if (isUnknown) {
      setQueue(prev => [...prev, currentCardId]);
    }

    // Determine if we should move to the next
    // The queue might have just expanded if it was unknown
    const nextIndex = currentIndex + 1;
    const finalQueueLen = isUnknown ? queue.length + 1 : queue.length;

    if (nextIndex < finalQueueLen) {
      setCurrentIndex(nextIndex);
      setIsFlipped(false);
      setTestDirection(Math.random() > 0.5 ? 'to-zh' : 'to-en');
    } else {
      setView('summary');
    }
  };

  const currentCard = cards.find(c => c.id === queue[currentIndex]);

  const summaryStats = useMemo(() => {
    const studiedIds = new Set(queue);
    const studiedCards = cards.filter(c => studiedIds.has(c.id));
    
    const familiar = studiedCards.filter(c => c.status === 'familiar');
    const unfamiliar = studiedCards.filter(c => c.status === 'unfamiliar');
    const unknown = studiedCards.filter(c => c.status === 'unknown');

    return { familiar, unfamiliar, unknown };
  }, [cards, queue]);

  const progressPercent = queue.length > 0 ? (currentIndex / queue.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">制造名辞典</h1>
          </div>
          {view === 'study' && (
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <span>{currentIndex + 1} / {queue.length}</span>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        {view === 'home' && (
          <div className="w-full max-w-lg text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                生产制造核心考点
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                包含系统抽取的 {cards.length} 个核心术语。<br/>
                利用随机正反面考察和间隔重复，助你高分通过考试。
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => startSession()}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <BookOpen size={24} className="transition-transform group-hover:scale-110" />
                <span>开始全局学习 ({cards.length})</span>
              </button>

              {cards.some(c => c.status === 'unfamiliar' || c.status === 'unknown') && (
                <button 
                  onClick={() => {
                    const weakIds = cards
                      .filter(c => c.status === 'unfamiliar' || c.status === 'unknown')
                      .map(c => c.id);
                    startSession(weakIds);
                  }}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-8 py-4 text-lg font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                >
                  <RefreshCcw size={24} />
                  <span>复习陌生考点 ({
                    cards.filter(c => c.status === 'unfamiliar' || c.status === 'unknown').length
                  })</span>
                </button>
              )}
            </div>
          </div>
        )}

        {view === 'study' && currentCard && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center h-full">
            <div 
              className="w-full aspect-[4/3] perspective-1000 cursor-pointer group"
              onClick={() => !isFlipped && setIsFlipped(true)}
            >
              <motion.div 
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 text-center group-hover:border-indigo-300 transition-colors">
                  <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {testDirection === 'to-zh' ? '英作中' : '中翻英'}
                  </span>
                  
                  {testDirection === 'to-zh' ? (
                    <div className="space-y-4">
                      <h3 className="text-5xl font-black text-slate-800 tracking-tight">{currentCard.acronym}</h3>
                      <p className="text-lg text-slate-500 font-medium">{currentCard.english}</p>
                    </div>
                  ) : (
                    <h3 className="text-3xl font-bold text-slate-800 leading-tight">{currentCard.chinese}</h3>
                  )}

                  <div className="absolute bottom-6 inset-x-0 flex justify-center opacity-50 animate-pulse">
                    <span className="text-sm text-slate-400">点击卡片翻面看答案</span>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-indigo-600 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center [transform:rotateY(180deg)]">
                   <div className="space-y-6 w-full">
                     <div className="space-y-1">
                        <h4 className="text-sm font-medium text-indigo-200 uppercase tracking-widest">完整缩写</h4>
                        <div className="text-4xl font-black tracking-tight">{currentCard.acronym}</div>
                     </div>
                     <div className="w-12 h-0.5 bg-indigo-400 mx-auto rounded-full" />
                     <div className="space-y-1">
                        <h4 className="text-sm font-medium text-indigo-200 uppercase tracking-widest">英文原意</h4>
                        <div className="text-xl font-semibold leading-tight">{currentCard.english}</div>
                     </div>
                     <div className="w-12 h-0.5 bg-indigo-400 mx-auto rounded-full" />
                     <div className="space-y-1">
                        <h4 className="text-sm font-medium text-indigo-200 uppercase tracking-widest">中文含义</h4>
                        <div className="text-2xl font-bold leading-tight">{currentCard.chinese}</div>
                     </div>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Answer Actions */}
            <div className="h-24 mt-8 w-full">
              <AnimatePresence>
                {isFlipped ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-4 w-full"
                  >
                    <button 
                      onClick={() => handleStatusUpdate('unknown')}
                      className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors font-medium border border-rose-200/50"
                    >
                      <XOctagon size={24} />
                      <span>不知道</span>
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate('unfamiliar')}
                      className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium border border-amber-200/50"
                    >
                      <HelpCircle size={24} />
                      <span>陌生</span>
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate('familiar')}
                      className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium border border-emerald-200/50"
                    >
                      <CheckCircle2 size={24} />
                      <span>熟悉</span>
                    </button>
                  </motion.div>
                ) : (
                   <div className="w-full flex justify-center invisible">
                     <span className="p-4">Placeholder</span>
                   </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {view === 'summary' && (
          <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900">学习总结</h2>
              <p className="text-slate-500">你刚刚复习了 {queue.length} 个知识点</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex flex-col items-center text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                <h3 className="text-emerald-900 font-bold text-lg">已掌握</h3>
                <span className="text-3xl font-black text-emerald-600">{summaryStats.familiar.length}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex flex-col items-center text-center space-y-2">
                <HelpCircle size={32} className="text-amber-500 mb-2" />
                <h3 className="text-amber-900 font-bold text-lg">需巩固</h3>
                <span className="text-3xl font-black text-amber-600">{summaryStats.unfamiliar.length}</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex flex-col items-center text-center space-y-2">
                <XOctagon size={32} className="text-rose-500 mb-2" />
                <h3 className="text-rose-900 font-bold text-lg">待学习</h3>
                <span className="text-3xl font-black text-rose-600">{summaryStats.unknown.length}</span>
              </div>
            </div>

            {(summaryStats.unfamiliar.length > 0 || summaryStats.unknown.length > 0) && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                 <h3 className="font-bold text-lg text-slate-800 mb-4">重点复习名单:</h3>
                 <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {[...summaryStats.unknown, ...summaryStats.unfamiliar].map(card => (
                      <div key={card.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <div className="flex gap-4 items-center">
                           <span className={cn(
                             "w-2 h-2 rounded-full", 
                             card.status === 'unknown' ? 'bg-rose-500' : 'bg-amber-500'
                           )} />
                           <span className="font-bold text-slate-700 w-16">{card.acronym}</span>
                           <span className="text-slate-600 truncate max-w-[150px] sm:max-w-xs" title={card.english}>{card.english}</span>
                        </div>
                        <span className="text-slate-900 text-sm font-medium">{card.chinese}</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                 onClick={() => {
                   const weakIds = [...summaryStats.unfamiliar, ...summaryStats.unknown].map(c => c.id);
                   if(weakIds.length > 0) {
                     startSession(weakIds);
                   } else {
                     startSession();
                   }
                 }}
                 className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                 <RefreshCcw size={24} />
                 <span>重新学习 {(summaryStats.unfamiliar.length > 0 || summaryStats.unknown.length > 0) ? '薄弱项' : '全部'}</span>
              </button>
              
              <button 
                 onClick={() => setView('home')}
                 className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 px-6 py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                 返回主页
                 <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
