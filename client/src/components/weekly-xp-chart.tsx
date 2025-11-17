import { motion } from "framer-motion";

interface WeeklyXPChartProps {
  data: { day: string; xp: number }[];
}

export function WeeklyXPChart({ data }: WeeklyXPChartProps) {
  const maxXP = Math.max(...data.map(d => d.xp), 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-gray-400 font-medium">Weekly XP Progress</div>
      <div className="flex items-end justify-between gap-2 h-24">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.xp / maxXP) * 100}%` }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-md min-h-[4px] relative group"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.xp}
              </div>
            </motion.div>
            <div className="text-xs text-gray-500 font-medium">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
