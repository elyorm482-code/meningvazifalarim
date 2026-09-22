import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Timer, 
  AlertCircle,
  CheckCircle2,
  Plus,
  Briefcase,
  GraduationCap,
  User,
  HeartPulse,
  Wallet
} from 'lucide-react';
import { Task, Category } from '../types';
import { CATEGORIES_CONFIG } from '../data/initialTasks';

interface TaskCardProps {
  task: Task;
  onToggleTask: (taskId: string, e: React.MouseEvent) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onAiBreakdown: (task: Task) => void;
  isAiLoading?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteTask,
  onEditTask,
  onStartFocus,
  onAiBreakdown,
  isAiLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [newSubtaskText, setNewSubtaskText] = useState<string>('');
  const [showAddSubtask, setShowAddSubtask] = useState<boolean>(false);

  const categoryMeta = CATEGORIES_CONFIG[task.category] || CATEGORIES_CONFIG['Ish'];

  // Calculate subtasks completion
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Check if due today or overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const isDueToday = task.dueDate === todayStr;
  const isOverdue = task.dueDate ? task.dueDate < todayStr && !task.completed : false;

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    onAddSubtask(task.id, newSubtaskText.trim());
    setNewSubtaskText('');
    setShowAddSubtask(false);
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'Ish': return <Briefcase className="w-3.5 h-3.5" />;
      case 'O\'qish': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Shaxsiy': return <User className="w-3.5 h-3.5" />;
      case 'Sog\'liq': return <HeartPulse className="w-3.5 h-3.5" />;
      case 'Moliya': return <Wallet className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all border ${
        task.completed
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60'
      }`}
    >
      <div className="flex items-start gap-3.5">
        
        {/* Checkbox */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => onToggleTask(task.id, e)}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-xl flex items-center justify-center transition border ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
          }`}
          title={task.completed ? 'Bajarilmagan deb belgilash' : 'Bajarildi deb belgilash'}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-sm sm:text-base font-semibold cursor-pointer select-none transition-all ${
                  task.completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className={`text-xs mt-1 line-clamp-2 ${
                  task.completed ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions button strip (visible on desktop hover or mobile) */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {!task.completed && (
                <button
                  onClick={() => onStartFocus(task)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Diqqat taymerini ishga tushirish"
                >
                  <Timer className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onEditTask(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                title="Tahrirlash"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Badges & Meta info */}
          <div className="flex items-center flex-wrap gap-2 mt-3 text-xs">
            
            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium border ${categoryMeta.bgLight} ${categoryMeta.borderLight} text-slate-700 dark:text-slate-200`}>
              {getCategoryIcon(task.category)}
              <span>{task.category}</span>
            </span>

            {/* Priority Badge */}
            {task.priority === 'high' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                Shoshilinch
              </span>
            )}
            {task.priority === 'medium' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                O'rtacha
              </span>
            )}
            {task.priority === 'low' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Oddiy
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium ${
                isOverdue 
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : isDueToday 
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{isDueToday ? 'Bugun' : task.dueDate}</span>
                {task.dueTime && (
                  <span className="tabular-nums">({task.dueTime})</span>
                )}
              </span>
            )}

            {/* Subtask pill button */}
            {totalSubtasks > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition"
              >
                <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                <span>{completedSubtasks}/{totalSubtasks}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {/* AI Breakdown Quick Action (if subtasks empty and task active) */}
            {totalSubtasks === 0 && !task.completed && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onAiBreakdown(task)}
                disabled={isAiLoading}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60 font-semibold transition"
              >
                <Sparkles className={`w-3 h-3 text-violet-500 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>AI bilan maydalash</span>
              </motion.button>
            )}

          </div>

          {/* Subtasks progress bar (if has subtasks) */}
          {totalSubtasks > 0 && (
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div
                className="bg-indigo-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${subtaskProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Expandable Subtask checklist section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Quyi bosqichlar ({completedSubtasks}/{totalSubtasks})</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAiBreakdown(task)}
                      disabled={isAiLoading}
                      className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI bilan yangilash</span>
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setShowAddSubtask(!showAddSubtask)}
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Bosqich qo'shish</span>
                    </button>
                  </div>
                </div>

                {/* Subtask items */}
                {task.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none transition"
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                      sub.completed 
                        ? 'bg-indigo-500 border-indigo-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs ${
                      sub.completed 
                        ? 'line-through text-slate-400 dark:text-slate-500' 
                        : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {sub.text}
                    </span>
                  </div>
                ))}

                {/* Quick Add Subtask form */}
                {showAddSubtask && (
                  <form onSubmit={handleCreateSubtask} className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Yangi qadam nomi..."
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      autoFocus
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                    >
                      Qo'shish
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
};
