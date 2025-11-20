import { UserState } from '@/reducers/user';

export const loadStateFromLocalStorage = (): UserState => {
  const serializedState = localStorage.getItem('userState');

  if (serializedState === null) {
    return {};
  }

  return JSON.parse(serializedState) as UserState;
};

export const saveStateToLocalStorage = (state: UserState) => {
  const serializedState = JSON.stringify(state);
  localStorage.setItem('userState', serializedState);
};

export const clearStateFromLocalStorage = () =>
  localStorage.removeItem('userState');
