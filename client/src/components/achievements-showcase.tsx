import { motion } from "framer-motion";
import { Trophy, Flame, Zap, Target, Star, Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  requirement?: number;
}

interface AchievementsShowcaseProps {
  achievements: Achievement[];
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  target: Target,
  star: Star,
  award: Award,
};

export function AchievementsShowcase({ achievements }: AchievementsShowcaseProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-gray-400 font-medium">Achievements</div>
      <div className="grid grid-cols-6 gap-3">
        <TooltipProvider>
          {achievements.map((achievement, i) => {
            const Icon = iconMap[achievement.icon] || Trophy;
            return (
              <Tooltip key={achievement.id}>
                <TooltipTrigger>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-yellow-500 to-orange-500 border-yellow-400 shadow-lg shadow-yellow-500/50"
                        : "bg-gray-800 border-gray-700 opacity-40"
                    }`}
                  >
                    <Icon
                      className={achievement.unlocked ? "text-white" : "text-gray-600"}
                      size={28}
                    />
                    {achievement.unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs">
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-bold">{achievement.name}</p>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">
                        Progress: {achievement.progress}/{achievement.requirement}
                      </div>
                      <div className="w-full bg-gray-700 h-1 rounded-full mt-1">
                        <div
                          className="bg-purple-500 h-1 rounded-full transition-all"
                          style={{ width: `${(achievement.progress / (achievement.requirement || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
