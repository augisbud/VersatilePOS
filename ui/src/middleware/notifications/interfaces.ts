import { UnknownAction } from '@reduxjs/toolkit';

export interface NotificationConfig {
  type: 'success' | 'error';
  message: string;
}

export interface NotificationConfigs {
  [actionName: string]: (action: UnknownAction) => NotificationConfig;
}

export interface RejectetAction extends UnknownAction {
  error: Error;
}
