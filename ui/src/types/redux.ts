import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { rootReducer } from '../reducers';
import { createStore } from '@/store/store';

export type Store = ReturnType<typeof createStore>;

export type State = ReturnType<typeof rootReducer>;

export type Dispatch = ThunkDispatch<State, unknown, UnknownAction>;
