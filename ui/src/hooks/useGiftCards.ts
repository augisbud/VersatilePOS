import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getGiftCards,
  getSelectedGiftCard,
  getCheckedGiftCard,
  getGiftCardsLoading,
  getGiftCardsError,
  getActiveGiftCards,
} from '@/selectors/giftCard';
import {
  fetchGiftCards as fetchGiftCardsAction,
  fetchGiftCardById as fetchGiftCardByIdAction,
  addGiftCard as addGiftCardAction,
  checkBalance as checkBalanceAction,
  deactivateCard as deactivateCardAction,
} from '@/actions/giftCard';
import {
  ModelsCreateGiftCardRequest,
  ModelsCheckBalanceRequest,
} from '@/api/types.gen';

export const useGiftCards = () => {
  const dispatch = useAppDispatch();
  const giftCards = useAppSelector(getGiftCards);
  const selectedGiftCard = useAppSelector(getSelectedGiftCard);
  const checkedGiftCard = useAppSelector(getCheckedGiftCard);
  const activeGiftCards = useAppSelector(getActiveGiftCards);
  const loading = useAppSelector(getGiftCardsLoading);
  const error = useAppSelector(getGiftCardsError);

  const fetchGiftCards = async () => {
    return dispatch(fetchGiftCardsAction()).unwrap();
  };

  const fetchGiftCardById = async (giftCardId: number) => {
    return dispatch(fetchGiftCardByIdAction(giftCardId)).unwrap();
  };

  const createGiftCard = async (giftCardData: ModelsCreateGiftCardRequest) => {
    return dispatch(addGiftCardAction(giftCardData)).unwrap();
  };

  const checkGiftCardBalance = async (data: ModelsCheckBalanceRequest) => {
    return dispatch(checkBalanceAction(data)).unwrap();
  };

  const deactivateGiftCard = async (giftCardId: number) => {
    return dispatch(deactivateCardAction(giftCardId)).unwrap();
  };

  return {
    giftCards,
    selectedGiftCard,
    checkedGiftCard,
    activeGiftCards,
    loading,
    error,
    fetchGiftCards,
    fetchGiftCardById,
    createGiftCard,
    checkGiftCardBalance,
    deactivateGiftCard,
  };
};
