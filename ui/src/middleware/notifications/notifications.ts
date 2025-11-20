import { createListenerMiddleware, UnknownAction } from '@reduxjs/toolkit';

import { Dispatch, State } from '@/types/redux';
import { NotificationConfig } from './interfaces';
import { NOTIFICATIONS_CONFIG } from './config';
import { message } from 'antd';

export const createNotificationsMiddleware = () => {
  const listenerMiddleware = createListenerMiddleware<State, Dispatch>();

  listenerMiddleware.startListening({
    predicate: (action: UnknownAction) =>
      Boolean(NOTIFICATIONS_CONFIG[action.type]),
    effect: (action) =>
      showNotification(NOTIFICATIONS_CONFIG[action.type](action)),
  });

  return listenerMiddleware.middleware;
};

const showNotification = (config: NotificationConfig) => {
  const notification =
    config.message.slice(0, 1).toUpperCase() + config.message.slice(1);

  if (config.type === 'success') {
    message.success(notification);
  } else {
    message.error(notification);
  }

  setTimeout(() => {
    message.destroy();
  }, 2500);
};
