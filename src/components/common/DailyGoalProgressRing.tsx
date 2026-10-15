import React from 'react';
import { UserProfile } from '../../types';
import { DailyGoalTracker } from './DailyGoalTracker';

interface DailyGoalProgressRingProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onStartLesson?: () => void;
  onNavigate?: (screen: string) => void;
  onExtendStreak?: (newStreak: number) => void;
  size?: number;
  compact?: boolean;
}

export const DailyGoalProgressRing: React.FC<DailyGoalProgressRingProps> = (props) => {
  return <DailyGoalTracker {...props} />;
};
