import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ListTodo, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';

interface StatsBannerProps {
  totalCount: number;
  completedCount: number;
  activeCount: number;
  urgentCount: number;
  aiCoachAdvice: string;
  loadingCoach: boolean;
  onRefreshCoach: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  totalCount,
  completedCount,
  activeCount,
  urgentCount,
  aiCoachAdvice,
  loadingCoach,
  onRefreshCoach,
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Motivational quote based on percentage
  let statusMessage = "Kuningizni unumli rejalashtirish uchun qulay fursat!";
  if (totalCount > 0) {
    if (percentage === 100) {
      statusMessage = "Qoyilmaqom! Bugungi barcha vazifalar to'liq bajarildi! 🎉";
    } else if (percentage >= 70) {
      statusMessage = "Deyarli tugadi! Oxirgi marraga yetishingizga oz qoldi.";
    } else if (percentage >= 40) {
      statusMessage = "Yarim yo'l bosib o'tildi. Sur'atni tushirmang!";
    } else if (percentage > 0) {
      statusMessage = "Boshlanishi zo'r! Har bir bajarilgan ish kuch bag'ishlaydi.";
    }
  }

  // Circular progress stroke calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 dark:from-slate-900/90 dark:via-slate-900/50 dark:to-indigo-950/40 rounded-3xl p-5 sm:p-6 border border-indigo-100/80 dark:border-slate-800 shadow-sm mb-6 transition-all">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left: Circular Progress & Motivational status */}
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                stroke={percentage === 100 ? '#10b981' : '#6366f1'}
                strokeWidth="7"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                {percentage}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                natija
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-800 dark:text-slate-100">
              {percentage === 100 ? "Kunlik g'alaba!" : "Bugungi unumdorlik"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md">
              {statusMessage}
            </p>

            {/* AI Coach micro-tip */}
            {aiCoachAdvice && (
              <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 flex items-start gap-2 text-xs bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-200 px-3 py-2 rounded-xl"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span className="flex-1 italic">{aiCoachAdvice}</span>
                <button
                  onClick={onRefreshCoach}
                  disabled={loadingCoach}
                  title="Yangi maslahat olish"
                  className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition text-indigo-600 dark:text-indigo-400 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingCoach ? 'animate-spin' : ''}`} />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right: Quick metrics bento grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
          
          {/* Total */}
          <div className="bg-white/90 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Jami</div>
              <div className="text-base font-bold text-slate-900 dark:text-white font-heading">
                {totalCount}
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="bg-white/90 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Jarayonda</div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 font-heading">
                {activeCount}
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white/90 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Bajarildi</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-heading">
                {completedCount}
              </div>
            </div>
          </div>

          {/* Urgent */}
          <div className="bg-white/90 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Shoshilinch</div>
              <div className="text-base font-bold text-rose-600 dark:text-rose-400 font-heading">
                {urgentCount}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
