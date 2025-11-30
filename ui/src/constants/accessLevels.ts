import { ConstantsAccessLevel } from '@/api/types.gen';

export const ACCESS_LEVELS: ConstantsAccessLevel[] = ['Read', 'Write'];

export const ACCESS_LEVEL_DESCRIPTIONS: Record<ConstantsAccessLevel, string> = {
  Read: 'View and retrieve data',
  Write: 'Create, update, and delete data',
};

export const getAllAccessLevels = (): ConstantsAccessLevel[] => ACCESS_LEVELS;

export const getAccessLevelDescription = (
  level: ConstantsAccessLevel
): string => ACCESS_LEVEL_DESCRIPTIONS[level];
