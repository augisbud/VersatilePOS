export type BillItem = {
  id?: number;
  itemId: number;
  itemName: string;
  quantity: number;
  lineTotal: number;
};

export type Bill = {
  id: number;
  isPaid: boolean;
  paymentType?: PaymentType;
};

export type ItemBillAssignment = {
  [itemIndex: number]: number | null;
};

export type PaymentType = 'Cash' | 'CreditCard' | 'GiftCard';

export type SplitBillPaymentRequest = {
  billId: number;
  amount: number;
  tipAmount?: number;
  itemIndices: number[];
  paymentType: PaymentType;
  giftCardCode?: string;
  isPartialPayment?: boolean;
};
