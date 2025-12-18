export interface GiftCardPaymentResult {
  giftCardId: number;
  giftCardCode: string;
  amountUsed: number;
  remainingAmount: number;
  isPartialPayment: boolean;
}

export interface GiftCardPaymentModalProps {
  open: boolean;
  amount: number;
  onSuccess: (result: GiftCardPaymentResult) => void;
  onCancel: () => void;
}
