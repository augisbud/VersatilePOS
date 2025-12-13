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
};

export type ItemBillAssignment = {
  [itemIndex: number]: number | null;
};

export type PaymentType = 'Cash' | 'CreditCard' | 'GiftCard';
