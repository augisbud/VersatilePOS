/* eslint-disable no-restricted-imports */
import {
  type TypedUseSelectorHook,
  useSelector as defaultUseSelector,
} from 'react-redux';
import { type State } from '@/types/redux';

export const useAppSelector: TypedUseSelectorHook<State> = defaultUseSelector;
