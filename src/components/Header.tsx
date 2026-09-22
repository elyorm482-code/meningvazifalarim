import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Plus, 
  Timer, 
  Sparkles,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenNewTask: () => void;
  onOpenPomodoro: () => void;
  onOpenAiAssistant: () => void;
  streak: number;
  completedCount: number;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  isDark,
  onToggleDark,
  onOpenNewTask,
  onOpenPomodoro,
  onOpenAiAssistant,
  streak,
  completedCount,
  activeCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Xush kelibsiz');

  useEffect(() => {
    const updateGreetingAndTime = () => {
      const now = new Date();
      const hours = now.getHours();
      let greet = 'Xayrli kun';
      if (hours >= 5 && hours < 11) {
        greet = 'Xayrli tong';
      } else if (hours >= 11 && hours < 17) {
        greet = 'Xayrli kun';
      } else if (hours >= 17 && hours < 22) {
        greet = 'Xayrli oqshom';
      } else {
        greet = 'Xayrli tun';
      }
      setGreeting(greet);

      setCurrentTime(
        now.toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateGreetingAndTime();
    const timer = setInterval(updateGreetingAndTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Greeting */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <motion.div 
            whileHover={{ scale: 1.06, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25"
          >
            <CheckCircle2 className="w-6 h-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                Vazifalar Boshqaruvi
              </h1>
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                Jonli
              </motion.span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>{greeting}!</span>
              <span>•</span>
              <span className="tabular-nums font-medium">{currentTime}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {completedCount} ta bajarildi
              </span>
            </p>
          </div>
        </div>

        {/* Center / Right: Streak, Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full md:w-auto justify-end">
          
          {/* Daily Streak Badge */}
          <motion.div 
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-bold"
            title="Kunlik ketma-ketlik"
          >
            <Flame className="w-4 h-4 text-amber-500 animate-pulse fill-amber-500" />
            <span>{streak} kun</span>
          </motion.div>

          {/* AI Assistant Button */}
          <motion.button
            id="btn-ai-assistant"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-semibold shadow-sm shadow-violet-500/20 hover:brightness-105 transition"
            title="AI Yordamchi maslahatlari"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Yordamchi</span>
          </motion.button>

          {/* Pomodoro Timer Button */}
          <motion.button
            id="btn-open-pomodoro"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenPomodoro}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
            title="Diqqat / Pomodoro taymeri"
          >
            <Timer className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Diqqat</span>
          </motion.button>

          {/* Sound Toggle */}
          <motion.button
            id="btn-toggle-sound"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleSound}
            className={`p-2 rounded-xl text-xs transition border ${
              soundEnabled
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={soundEnabled ? 'Ovoz yoqilgan' : 'Ovoz o\'chirilgan'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            id="btn-toggle-theme"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleDark}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={isDark ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          {/* New Task Button */}
          <motion.button
            id="btn-add-task-header"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/25 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yangi vazifa</span>
          </motion.button>

        </div>
      </div>
    </header>
  );
};
