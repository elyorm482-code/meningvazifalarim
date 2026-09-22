import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Briefcase, 
  GraduationCap, 
  User, 
  HeartPulse, 
  Wallet,
  AlertCircle
} from 'lucide-react';
import { Task, Category, Priority, Subtask } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string }) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Ish');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [subtasks, setSubtasks] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate || '');
      setDueTime(initialTask.dueTime || '');
      setSubtasks(initialTask.subtasks || []);
    } else {
      // Default new task
      setTitle('');
      setDescription('');
      setCategory('Ish');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('');
      setSubtasks([]);
    }
    setAiAdvice('');
  }, [initialTask, isOpen]);

  const handleAddManualSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: newSubtaskInput.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleAiBreakdown = async () => {
    if (!title.trim()) {
      alert('Iltimos, avval vazifa nomini kiriting');
      return;
    }

    setIsAiLoading(true);
    setAiAdvice('');
    try {
      const res = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, description }),
      });
      const data = await res.json();
      if (Array.isArray(data.subtasks)) {
        const generatedSubtasks: Subtask[] = data.subtasks.map((text: string, idx: number) => ({
          id: `ai-sub-${Date.now()}-${idx}`,
          text,
          completed: false,
        }));
        setSubtasks(generatedSubtasks);
      }
      if (data.advice) {
        setAiAdvice(data.advice);
      }
    } catch (e) {
      console.error('AI breakdown error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(initialTask ? { id: initialTask.id } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      subtasks,
    });
    onClose();
  };

  if (!isOpen) return null;

  const categories: Array<{ id: Category; label: string; icon: React.ReactNode }> = [
    { id: 'Ish', label: 'Ish', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'O\'qish', label: 'O\'qish', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'Shaxsiy', label: 'Shaxsiy', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'Sog\'liq', label: 'Sog\'liq', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { id: 'Loyiha', label: 'Loyiha', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'Moliya', label: 'Moliya', icon: <Wallet className="w-3.5 h-3.5" /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                {initialTask ? 'Vazifani tahrirlash' : 'Yangi vazifa yaratish'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maqsadlaringizni belgilang va bosqichma-bosqich erishing
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5 mt-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Vazifa nomi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: Ingliz tili darsini takrorlash..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Qo'shimcha tavsif (ixtiyoriy)
              </label>
              <textarea
                rows={2}
                placeholder="Batafsil ma'lumot, eslatmalar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategoriya
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium transition border ${
                      category === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Muhimlik darajasi
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    priority === 'high'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  Shoshilinch 🔥
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                    priority === 'medium'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                  }`}
                >
                  O'rtacha
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                    priority === 'low'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                  }`}
                >
                  Oddiy
                </button>
              </div>
            </div>

            {/* Due date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Muddati (Sana)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Vaqt (ixtiyoriy)</span>
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Subtasks Section with AI Breakdown */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quyi bosqichlar ({subtasks.length})
                </label>
                
                {/* AI Breakdown Button */}
                <button
                  type="button"
                  onClick={handleAiBreakdown}
                  disabled={isAiLoading || !title.trim()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-50 transition"
                  title="Gemini orqali maydalash"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>{isAiLoading ? 'AI tahlil qilmoqda...' : 'AI bilan maydalash'}</span>
                </button>
              </div>

              {aiAdvice && (
                <div className="mb-3 p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/50 text-xs text-violet-800 dark:text-violet-200 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <span><strong>AI Maslahati:</strong> {aiAdvice}</span>
                </div>
              )}

              {/* Subtask list */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-200 truncate">
                      {idx + 1}. {sub.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Yangi qadam qo'shish..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManualSubtask();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddManualSubtask}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md shadow-indigo-500/25 transition"
              >
                {initialTask ? 'Saqlash' : 'Vazifani yaratish'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
