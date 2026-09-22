import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  CheckCircle2, 
  Coffee, 
  Flame 
} from 'lucide-react';
import { Task } from '../types';
import { playTimerFinishSound } from '../utils/sound';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTask: Task | null;
  onCompleteTask: (taskId: string) => void;
  soundEnabled: boolean;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  activeTask,
  onCompleteTask,
  soundEnabled,
}) => {
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Mode durations in seconds
  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    setTimeLeft(durations[mode]);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsRunning(false);
            playTimerFinishSound(soundEnabled);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const currentDuration = durations[mode];
  const progressPercent = ((currentDuration - timeLeft) / currentDuration) * 100;

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mode Tabs */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setMode('focus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'focus'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Diqqat (25m)</span>
            </button>

            <button
              onClick={() => setMode('shortBreak')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'shortBreak'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Qisqa tanaffus (5m)</span>
            </button>

            <button
              onClick={() => setMode('longBreak')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'longBreak'
                  ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Katta dam (15m)</span>
            </button>
          </div>

          {/* Active Task Info (if selected) */}
          {activeTask ? (
            <div className="mb-6 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                Hozirgi vazifa
              </span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activeTask.title}
              </h4>
            </div>
          ) : (
            <div className="mb-6 text-xs text-slate-400">
              Vazifalardan birini tanlab diqqatni jamlang
            </div>
          )}

          {/* Big Animated Timer Circle */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center my-4">
            {/* Pulsing breathing background glow when active */}
            {isRunning && (
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.15, 0.35, 0.15],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-rose-500 filter blur-xl"
              />
            )}

            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="92"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="92"
                stroke={mode === 'focus' ? '#f43f5e' : mode === 'shortBreak' ? '#10b981' : '#3b82f6'}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 92}
                strokeDashoffset={2 * Math.PI * 92 - (progressPercent / 100) * (2 * Math.PI * 92)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500"
              />
            </svg>

            {/* Timer digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formattedTime}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                {isRunning ? 'Jarayonda...' : 'To\'xtatilgan'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Qayta boshlash"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl font-bold text-white shadow-lg transition flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-white" />
                  <span>Pauza</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>Boshlash</span>
                </>
              )}
            </motion.button>

            {activeTask && !activeTask.completed && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onCompleteTask(activeTask.id);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                title="Vazifani bajarildi deb belgilash"
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.button>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
