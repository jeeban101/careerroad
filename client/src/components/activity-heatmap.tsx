import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Generate last 30 days
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-gray-800";
    if (count <= 2) return "bg-emerald-900/40";
    if (count <= 5) return "bg-emerald-700/60";
    if (count <= 8) return "bg-emerald-500/80";
    return "bg-emerald-400";
  };

  const getCount = (date: string) => {
    const activity = data.find(d => d.date === date);
    return activity?.count || 0;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-400 font-medium">Last 30 Days Activity</div>
      <div className="grid grid-cols-15 gap-1">
        <TooltipProvider>
          {days.map((date, i) => {
            const count = getCount(date);
            return (
              <Tooltip key={i}>
                <TooltipTrigger>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`w-3 h-3 rounded-sm ${getIntensity(count)} hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{date}</p>
                  <p className="text-xs font-bold">{count} {count === 1 ? 'activity' : 'activities'}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-900/40"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-700/60"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-500/80"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
