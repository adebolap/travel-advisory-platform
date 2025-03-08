import { motion } from "framer-motion";
import { achievementTypes } from "@shared/schema";
import type { AchievementType, AchievementLevel } from "@shared/schema";

interface AchievementBadgeProps {
  type: AchievementType;
  level: AchievementLevel;
  progress: number;
  isNew?: boolean;
}

export function AchievementBadge({ type, level, progress, isNew }: AchievementBadgeProps) {
  const achievement = achievementTypes[type][level];
  const progressPercentage = Math.min(
    (progress / achievement.count) * 100,
    100
  );

  return (
    <motion.div
      initial={isNew ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="relative flex flex-col items-center p-4 rounded-lg bg-card border hover:border-primary/50 transition-colors"
    >
      <motion.div
        className="text-4xl mb-2"
        animate={isNew ? { 
          rotate: [0, 360],
          scale: [1, 1.2, 1] 
        } : {}}
        transition={{ duration: 1 }}
      >
        {achievement.icon}
      </motion.div>

      <h3 className="font-semibold text-center">{achievement.title}</h3>

      <div className="w-full mt-2">
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-1">
          {progress} / {achievement.count}
        </p>
      </div>

      {isNew && (
        <motion.div
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg"
        >
          New!
        </motion.div>
      )}
    </motion.div>
  );
}