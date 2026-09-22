import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Check, 
  Lightbulb, 
  Flame, 
  Send,
  RefreshCw,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Compass
} from 'lucide-react';
import { Task, Category, Priority } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subtasks'>) => void;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  streak: number;
}

interface SuggestionItem {
  title: string;
  category: Category;
  priority: Priority;
  added?: boolean;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  totalTasks,
  completedTasks,
  pendingTasks,
  streak,
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'coach'>('suggestions');
  const [selectedTheme, setSelectedTheme] = useState<string>('ish');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([
    { title: 'Bugungi 3 ta eng ustuvor vazifani daftarga qayd qilish', category: 'Ish', priority: 'high' },
    { title: 'Ingliz tilida 15 daqiqa audiokitob yoki podkast tinglash', category: 'O\'qish', priority: 'medium' },
    { title: 'Kechki payt telefonni 1 soat oldin chetga qo\'yish', category: 'Sog\'liq', priority: 'low' },
  ]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [coachAdvice, setCoachAdvice] = useState<string>('');
  const [isLoadingCoach, setIsLoadingCoach] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFetchSuggestions = async (theme: string) => {
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions.map((item: { title: string; category?: string; priority?: string }) => ({
          title: item.title,
          category: (item.category as Category) || 'Ish',
          priority: (item.priority as Priority) || 'medium',
          added: false,
        })));
      }
    } catch (e) {
      console.error('Fetch suggestions error:', e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleFetchCoach = async () => {
    setIsLoadingCoach(true);
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalTasks, completedTasks, pendingTasks, streak }),
      });
      const data = await res.json();
      if (data.advice) {
        setCoachAdvice(data.advice);
      }
    } catch (e) {
      console.error('Fetch coach advice error:', e);
    } finally {
      setIsLoadingCoach(false);
    }
  };

  const handleAddSuggestion = (item: SuggestionItem, index: number) => {
    onAddTask({
      title: item.title,
      category: item.category,
      priority: item.priority,
      dueDate: new Date().toISOString().split('T')[0],
    });
    setSuggestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], added: true };
      return copy;
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  AI Yordamchi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aqlli takliflar va samaradorlik murabbiyi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'suggestions'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Aqlli Vazifa Takliflari</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('coach');
                if (!coachAdvice) handleFetchCoach();
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'coach'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Samaradorlik Tahlili</span>
            </button>
          </div>

          {/* Tab 1: Task Suggestions */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4 mt-4">
              {/* Quick Themes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Qaysi yo'nalishda reja tuzmoqchisiz?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      setSelectedTheme('ish');
                      handleFetchSuggestions('ish va unumdorlik');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      selectedTheme === 'ish'
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Ish & Karyera</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTheme('oqish');
                      handleFetchSuggestions('ilm va kitobxonlik');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      selectedTheme === 'oqish'
                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>O'qish & Ta'lim</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTheme('soglik');
                      handleFetchSuggestions('salomatlik va sport');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      selectedTheme === 'soglik'
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span>Sog'liq & Sport</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTheme('umumiy');
                      handleFetchSuggestions('shaxsiy rivojlanish va odatlar');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      selectedTheme === 'umumiy'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Shaxsiy rivoj</span>
                  </button>
                </div>
              </div>

              {/* Custom goal input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Yoki o'z maqsadingizni yozing (masalan: Yangi dastur o'rganish)..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customGoal.trim()) {
                      handleFetchSuggestions(customGoal.trim());
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={() => customGoal.trim() && handleFetchSuggestions(customGoal.trim())}
                  disabled={isLoadingSuggestions || !customGoal.trim()}
                  className="p-2.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                  title="Yaratish"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Suggestions List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold">Tavsiya etilayotgan vazifalar:</span>
                  {isLoadingSuggestions && (
                    <span className="inline-flex items-center gap-1 text-indigo-500 animate-pulse font-medium">
                      <Sparkles className="w-3 h-3" />
                      Yaratilmoqda...
                    </span>
                  )}
                </div>

                {suggestions.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          item.priority === 'high' ? 'text-rose-500' : item.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {item.priority === 'high' ? 'Shoshilinch' : item.priority === 'medium' ? 'O\'rtacha' : 'Oddiy'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddSuggestion(item, idx)}
                      disabled={item.added}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        item.added
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {item.added ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Qo'shildi</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Qo'shish</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Productivity Coach */}
          {activeTab === 'coach' && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-violet-50/60 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Xulosasi</span>
                  </span>
                  <button
                    onClick={handleFetchCoach}
                    disabled={isLoadingCoach}
                    className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition"
                    title="Yangilash"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCoach ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100 font-medium">
                  {isLoadingCoach ? (
                    <span className="text-slate-400 animate-pulse">
                      Vazifalar holati tahlil qilinmoqda...
                    </span>
                  ) : coachAdvice || (
                    `Bugun sizda ${totalTasks} ta vazifa mavjud, ulardan ${completedTasks} tasi bajarildi. Sur'atni saqlang va diqqatni eng muhim 1 ta maqsadga qarating!`
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs text-slate-500">Ketma-ketlik</div>
                  <div className="text-lg font-bold text-amber-500 font-heading">
                    {streak} kun 🔥
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs text-slate-500">Bajarilish foizi</div>
                  <div className="text-lg font-bold text-emerald-500 font-heading">
                    {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Yopish
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
