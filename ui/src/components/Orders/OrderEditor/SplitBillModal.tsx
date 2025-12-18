import { useState, useMemo, useCallback, useEffect } from 'react';
import { Modal, Button, Divider, Typography, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  BillItemsTable,
  BillTotal,
  BillCard,
  BillItem,
  Bill,
  ItemBillAssignment,
  PaymentType,
  SplitBillPaymentRequest,
} from './Bill';
import { TipSelector } from '@/components/shared';

type Props = {
  open: boolean;
  items: BillItem[];
  total: number;
  orderCreatedAt?: string;
  loading?: boolean;
  onPayBill: (request: SplitBillPaymentRequest) => Promise<void>;
  onClose: () => void;
};

const { Text } = Typography;

export const SplitBillModal = ({
  open,
  items,
  total,
  orderCreatedAt,
  loading,
  onPayBill,
  onClose,
}: Props) => {
  const [bills, setBills] = useState<Bill[]>([{ id: 1, isPaid: false }]);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(1);
  const [itemAssignments, setItemAssignments] = useState<ItemBillAssignment>(
    {}
  );
  const [payingBillId, setPayingBillId] = useState<number | null>(null);
  const [tipAmounts, setTipAmounts] = useState<Record<number, number>>({});
  const [tipPresets, setTipPresets] = useState<Record<number, number | null>>(
    {}
  );
  const [customTipFlags, setCustomTipFlags] = useState<Record<number, boolean>>(
    {}
  );

  const formattedOrderDate = orderCreatedAt
    ? dayjs(orderCreatedAt).format('YYYY-MM-DD HH:mm')
    : dayjs().format('YYYY-MM-DD HH:mm');

  // Calculate totals for each bill
  const billTotals = useMemo(() => {
    const totals: { [billId: number]: number } = {};
    bills.forEach((bill) => {
      totals[bill.id] = 0;
    });

    items.forEach((item, index) => {
      const assignedBillId = itemAssignments[index];
      if (assignedBillId && totals[assignedBillId] !== undefined) {
        totals[assignedBillId] += item.lineTotal;
      }
    });

    return totals;
  }, [bills, items, itemAssignments]);

  const handleAddBill = useCallback(() => {
    const newId = Math.max(...bills.map((b) => b.id), 0) + 1;
    setBills((prev) => [...prev, { id: newId, isPaid: false }]);
    setSelectedBillId(newId);
  }, [bills]);

  const handleSelectBill = useCallback((billId: number) => {
    setSelectedBillId((prev) => (prev === billId ? null : billId));
  }, []);

  const handleItemClick = useCallback(
    (itemIndex: number) => {
      if (!selectedBillId) return;

      setItemAssignments((prev) => {
        const currentAssignment = prev[itemIndex];
        if (currentAssignment === selectedBillId) {
          const { [itemIndex]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemIndex]: selectedBillId };
      });
    },
    [selectedBillId]
  );

  const handlePayBill = useCallback(
    async (billId: number, paymentType: PaymentType) => {
      const billTotal = billTotals[billId] || 0;
      if (billTotal === 0) return;
      const billTip = tipAmounts[billId] || 0;
      const amountWithTip = billTotal + billTip;

      const itemIndices = items
        .map((_, index) => index)
        .filter((index) => itemAssignments[index] === billId);

      setPayingBillId(billId);
      try {
        await onPayBill({
          billId,
          amount: amountWithTip,
          tipAmount: billTip,
          itemIndices,
          paymentType,
        });
        setBills((prev) =>
          prev.map((b) =>
            b.id === billId ? { ...b, isPaid: true, paymentType } : b
          )
        );
        // Clear tip state for paid bill
        setTipAmounts((prev) => {
          const { [billId]: _, ...rest } = prev;
          return rest;
        });
        setTipPresets((prev) => {
          const { [billId]: _, ...rest } = prev;
          return rest;
        });
        setCustomTipFlags((prev) => {
          const { [billId]: _, ...rest } = prev;
          return rest;
        });
      } finally {
        setPayingBillId(null);
      }
    },
    [billTotals, items, itemAssignments, onPayBill, tipAmounts]
  );

  const handleClose = useCallback(() => {
    setBills([{ id: 1, isPaid: false }]);
    setSelectedBillId(1);
    setItemAssignments({});
    setPayingBillId(null);
    setTipAmounts({});
    setTipPresets({});
    setCustomTipFlags({});
    onClose();
  }, [onClose]);

  const canClickItem = useCallback(
    (itemIndex: number) => {
      if (!selectedBillId) return false;
      const selectedBill = bills.find((b) => b.id === selectedBillId);
      if (selectedBill?.isPaid) return false;

      const assignedBillId = itemAssignments[itemIndex];
      if (assignedBillId) {
        const assignedBill = bills.find((b) => b.id === assignedBillId);
        if (assignedBill?.isPaid) return false;
      }
      return true;
    },
    [selectedBillId, bills, itemAssignments]
  );

  const allBillsPaid = bills.every((b) => b.isPaid);
  const hasUnassignedItems = items.some((_, index) => !itemAssignments[index]);
  const activeBillTotal = selectedBillId ? billTotals[selectedBillId] || 0 : 0;
  const activeTip = selectedBillId ? tipAmounts[selectedBillId] || 0 : 0;
  const activePreset = selectedBillId ? tipPresets[selectedBillId] ?? null : null;
  const activeIsCustom = selectedBillId
    ? customTipFlags[selectedBillId] ?? false
    : false;
  const activeTotalWithTip = activeBillTotal + activeTip;
  const totalTips = useMemo(
    () =>
      Object.entries(tipAmounts).reduce((sum, [, value]) => {
        return sum + (value || 0);
      }, 0),
    [tipAmounts]
  );
  const orderTotalWithTips = total + totalTips;

  const setTipForBill = useCallback(
    (billId: number, amount: number, preset: number | null, isCustom: boolean) => {
      setTipAmounts((prev) => ({ ...prev, [billId]: amount }));
      setTipPresets((prev) => ({ ...prev, [billId]: preset }));
      setCustomTipFlags((prev) => ({ ...prev, [billId]: isCustom }));
    },
    []
  );

  const handleTipPresetClick = useCallback(
    (percentage: number) => {
      if (!selectedBillId) return;
      const amount = Math.round(activeBillTotal * percentage * 100) / 100;
      setTipForBill(selectedBillId, amount, percentage, false);
    },
    [selectedBillId, activeBillTotal, setTipForBill]
  );

  const handleCustomTipChange = useCallback(
    (value: number | null) => {
      if (!selectedBillId) return;
      setTipForBill(selectedBillId, value || 0, null, true);
    },
    [selectedBillId, setTipForBill]
  );

  const handleNoTip = useCallback(() => {
    if (!selectedBillId) return;
    setTipForBill(selectedBillId, 0, null, false);
  }, [selectedBillId, setTipForBill]);

  useEffect(() => {
    if (!open) {
      setTipAmounts({});
      setTipPresets({});
      setCustomTipFlags({});
    }
  }, [open]);

  return (
    <Modal
      title="Split Order Bill"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={640}
      centered
      destroyOnClose
    >
      <Spin spinning={loading}>
        {/* Bills section */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          <Button
            type="dashed"
            onClick={handleAddBill}
            style={{
              height: 100,
              width: 100,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
            icon={<PlusOutlined />}
          >
            Add Bill
          </Button>

          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              total={billTotals[bill.id] || 0}
              isSelected={selectedBillId === bill.id}
              isPaying={payingBillId === bill.id}
              onSelect={() => handleSelectBill(bill.id)}
              onPay={(paymentType) => void handlePayBill(bill.id, paymentType)}
            />
          ))}
        </div>

        {selectedBillId &&
          !bills.find((b) => b.id === selectedBillId)?.isPaid && (
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginBottom: 8 }}
            >
              Click on items below to assign them to Bill {selectedBillId}
            </Text>
          )}

        <Divider style={{ margin: '12px 0' }} />

        <Text type="secondary" style={{ fontSize: 13 }}>
          Order created: {formattedOrderDate}
        </Text>

        <Divider style={{ margin: '12px 0' }} />

        <BillItemsTable
          items={items}
          showBillColumn
          bills={bills}
          itemAssignments={itemAssignments}
          selectedBillId={selectedBillId}
          onItemClick={handleItemClick}
          canClickItem={canClickItem}
        />

        <Divider style={{ margin: '12px 0' }} />

        {selectedBillId && (
          <>
            <TipSelector
              tipAmount={activeTip}
              selectedTipPreset={activePreset}
              isCustomTip={activeIsCustom}
              onPresetClick={handleTipPresetClick}
              onCustomChange={handleCustomTipChange}
              onNoTip={handleNoTip}
            />

            <Divider style={{ margin: '12px 0' }} />

            <BillTotal total={activeTotalWithTip} label={`Bill ${selectedBillId} Total:`} />
          </>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <BillTotal total={orderTotalWithTips} label="Order Total (with tips):" />

        {hasUnassignedItems && (
          <Text
            type="warning"
            style={{ fontSize: 12, display: 'block', marginTop: 8 }}
          >
            Some items are not assigned to any bill
          </Text>
        )}

        {allBillsPaid && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button type="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </Spin>
    </Modal>
  );
};
