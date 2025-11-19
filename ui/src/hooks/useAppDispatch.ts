/* eslint-disable no-restricted-imports */
import { useDispatch as defaultUseDispatch } from 'react-redux';
import { type Dispatch } from '@/types/redux';

export const useAppDispatch = () => defaultUseDispatch<Dispatch>();
