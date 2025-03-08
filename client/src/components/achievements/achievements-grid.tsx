import { AchievementBadge } from "./achievement-badge";
import { achievementTypes } from "@shared/schema";
import type { AchievementType, AchievementLevel } from "@shared/schema";

interface Achievement {
  type: AchievementType;
  level: AchievementLevel;
  progress: number;
  isNew?: boolean;
}

interface AchievementsGridProps {
  achievements: Achievement[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {achievements.map((achievement) => (
        <AchievementBadge
          key={`${achievement.type}-${achievement.level}`}
          {...achievement}
        />
      ))}
    </div>
  );
}
