import { createStore } from '@/store/store';
import { Provider } from 'react-redux';
import { PropsWithChildren, useMemo } from 'react';

export const WithStore = ({ children }: PropsWithChildren) => {
  const store = useMemo(() => createStore(), []);

  return <Provider store={store}>{children}</Provider>;
};
