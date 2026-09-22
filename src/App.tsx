import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  ListTodo, 
  SearchX, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Task, Category, Priority, FilterType, SortType, Subtask } from './types';
import { INITIAL_TASKS } from './data/initialTasks';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { 
  playCheckSound, 
  playUncheckSound, 
  playAddSound, 
  playDeleteSound, 
  playCelebrationSound 
} from './utils/sound';
import { triggerTaskConfetti, triggerMegaCelebration } from './utils/confetti';

const STORAGE_KEYS = {
  TASKS: 'vazifalar_tasks_v2',
  SOUND: 'vazifalar_sound_v1',
  THEME: 'vazifalar_theme_v1',
  STREAK: 'vazifalar_streak_v1',
};

export default function App() {
  // Load tasks from localStorage or initial
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load tasks:', e);
    }
    return INITIAL_TASKS;
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return false;
  });

  // Streak counter
  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (saved) return Number(saved);
    } catch {}
    return 3;
  });

  // Filters and search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [activeSort, setActiveSort] = useState<SortType>('newest');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState<boolean>(false);
  const [pomodoroTask, setPomodoroTask] = useState<Task | null>(null);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // AI coach state
  const [aiCoachAdvice, setAiCoachAdvice] = useState<string>(
    'Har bir kun kichik maqsadlardan boshlanadi. Eng muhim vazifani birinchi o\'ringa qo\'ying!'
  );
  const [loadingCoach, setLoadingCoach] = useState<boolean>(false);
  const [aiBreakdownLoadingId, setAiBreakdownLoadingId] = useState<string | null>(null);

  // Sync tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks:', e);
    }
  }, [tasks]);

  // Sync sound setting
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
    } catch {}
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initial coach advice fetch
  useEffect(() => {
    const fetchInitialAdvice = async () => {
      try {
        const completed = tasks.filter(t => t.completed).length;
        const res = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalTasks: tasks.length,
            completedTasks: completed,
            pendingTasks: tasks.length - completed,
            streak,
          }),
        });
        const data = await res.json();
        if (data.advice) {
          setAiCoachAdvice(data.advice);
        }
      } catch (e) {
        // Fallback default message is already set
      }
    };
    fetchInitialAdvice();
  }, []);

  const handleRefreshCoach = async () => {
    setLoadingCoach(true);
    try {
      const completed = tasks.filter(t => t.completed).length;
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalTasks: tasks.length,
          completedTasks: completed,
          pendingTasks: tasks.length - completed,
          streak,
        }),
      });
      const data = await res.json();
      if (data.advice) {
        setAiCoachAdvice(data.advice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCoach(false);
    }
  };

  // Metrics calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;
  const urgentCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = tasks.filter(t => t.dueDate === todayStr).length;

  // Toggle Task Completion
  const handleToggleTask = (taskId: string, e: React.MouseEvent) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const willBeCompleted = !targetTask.completed;

    if (willBeCompleted) {
      playCheckSound(soundEnabled);
      // Determine click coordinate or center of button
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      triggerTaskConfetti(x, y);

      // Check if this was the last remaining uncompleted task!
      if (activeCount === 1) {
        setTimeout(() => {
          triggerMegaCelebration();
          playCelebrationSound(soundEnabled);
        }, 300);
      }
    } else {
      playUncheckSound(soundEnabled);
    }

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            completed: willBeCompleted,
            // Mark all subtasks as completed if task is completed
            subtasks: willBeCompleted
              ? t.subtasks.map(s => ({ ...s, completed: true }))
              : t.subtasks,
          };
        }
        return t;
      })
    );
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map(s => {
            if (s.id === subtaskId) {
              const newStatus = !s.completed;
              if (newStatus) playCheckSound(soundEnabled);
              else playUncheckSound(soundEnabled);
              return { ...s, completed: newStatus };
            }
            return s;
          });

          // If all subtasks become completed, optionally mark task completed
          const allSubsDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);

          return {
            ...t,
            subtasks: updatedSubtasks,
            completed: allSubsDone ? true : t.completed,
          };
        }
        return t;
      })
    );
  };

  // Add Subtask manually
  const handleAddSubtask = (taskId: string, text: string) => {
    playAddSound(soundEnabled);
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: [
              ...t.subtasks,
              {
                id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                text,
                completed: false,
              },
            ],
          };
        }
        return t;
      })
    );
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    playDeleteSound(soundEnabled);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Save Task (Create or Update)
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Edit existing
      setTasks(prev =>
        prev.map(t =>
          t.id === taskData.id
            ? {
                ...t,
                title: taskData.title,
                description: taskData.description,
                category: taskData.category,
                priority: taskData.priority,
                dueDate: taskData.dueDate,
                dueTime: taskData.dueTime,
                subtasks: taskData.subtasks,
              }
            : t
        )
      );
    } else {
      // Create new
      playAddSound(soundEnabled);
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime,
        subtasks: taskData.subtasks || [],
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  // Direct AI breakdown from card
  const handleAiBreakdownOnCard = async (task: Task) => {
    setAiBreakdownLoadingId(task.id);
    try {
      const res = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          category: task.category,
          description: task.description,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        const generated: Subtask[] = data.subtasks.map((text: string, idx: number) => ({
          id: `ai-sub-${Date.now()}-${idx}`,
          text,
          completed: false,
        }));
        setTasks(prev =>
          prev.map(t => (t.id === task.id ? { ...t, subtasks: generated } : t))
        );
        playAddSound(soundEnabled);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiBreakdownLoadingId(null);
    }
  };

  // Open Pomodoro focus mode
  const handleStartFocus = (task: Task) => {
    setPomodoroTask(task);
    setIsPomodoroOpen(true);
  };

  // Add suggested task from AI modal
  const handleAddSuggestedTask = (
    suggested: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subtasks'>
  ) => {
    handleSaveTask({
      ...suggested,
      subtasks: [],
    });
  };

  // Filtered & Sorted Tasks list
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchCat = task.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Status tab filter
        if (activeFilter === 'active' && task.completed) return false;
        if (activeFilter === 'completed' && !task.completed) return false;
        if (activeFilter === 'urgent' && task.priority !== 'high') return false;
        if (activeFilter === 'today' && task.dueDate !== todayStr) return false;

        // Category pill filter
        if (activeCategory !== 'All' && task.category !== activeCategory) return false;

        return true;
      })
      .sort((a, b) => {
        if (activeSort === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (activeSort === 'priority') {
          const priorityWeights = { high: 3, medium: 2, low: 1 };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        if (activeSort === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (activeSort === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [tasks, searchQuery, activeFilter, activeCategory, activeSort, todayStr]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* Top Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onOpenNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenPomodoro={() => {
          setPomodoroTask(null);
          setIsPomodoroOpen(true);
        }}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        streak={streak}
        completedCount={completedCount}
        activeCount={activeCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Animated Stats Banner */}
        <StatsBanner
          totalCount={totalCount}
          completedCount={completedCount}
          activeCount={activeCount}
          urgentCount={urgentCount}
          aiCoachAdvice={aiCoachAdvice}
          loadingCoach={loadingCoach}
          onRefreshCoach={handleRefreshCoach}
        />

        {/* Filter, Search & Sorting Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          counts={{
            all: totalCount,
            active: activeCount,
            completed: completedCount,
            urgent: urgentCount,
            today: todayCount,
          }}
        />

        {/* Tasks List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleTask={handleToggleTask}
                  onToggleSubtask={handleToggleSubtask}
                  onAddSubtask={handleAddSubtask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={t => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                  onStartFocus={handleStartFocus}
                  onAiBreakdown={handleAiBreakdownOnCard}
                  isAiLoading={aiBreakdownLoadingId === task.id}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 px-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                  {searchQuery ? <SearchX className="w-6 h-6" /> : <ListTodo className="w-6 h-6" />}
                </div>
                <h3 className="text-base font-bold font-heading text-slate-800 dark:text-slate-200">
                  {searchQuery ? "Mos keluvchi vazifa topilmadi" : "Vazifalar ro'yxati bo'sh"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? "Boshqa so'z bilan qidirib ko'ring yoki filtrlarni tozalang."
                    : "Yangi vazifa qo'shing yoki AI yordamchi orqali kunlik takliflarni oling!"}
                </p>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yangi vazifa</span>
                  </button>

                  <button
                    onClick={() => setIsAiAssistantOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-semibold border border-violet-200 dark:border-violet-800 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    <span>AI takliflari</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Quick Action Button on Mobile */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center z-40"
          title="Yangi vazifa yaratish"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </motion.button>

      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Pomodoro Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isPomodoroOpen}
        onClose={() => {
          setIsPomodoroOpen(false);
          setPomodoroTask(null);
        }}
        activeTask={pomodoroTask}
        onCompleteTask={taskId => handleToggleTask(taskId, {} as React.MouseEvent)}
        soundEnabled={soundEnabled}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onAddTask={handleAddSuggestedTask}
        totalTasks={totalCount}
        completedTasks={completedCount}
        pendingTasks={activeCount}
        streak={streak}
      />

      {/* Minimal Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <span>Vazifalar Boshqaruvi</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Barcha ma'lumotlar saqlanmoqda
          </span>
        </div>
      </footer>

    </div>
  );
}
