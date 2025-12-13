import { useState, useCallback } from 'react';
import { Alert, Modal, message } from 'antd';
import { useOrderEditor, CustomerDetails } from '@/hooks/useOrderEditor';
import { usePayments } from '@/hooks/usePayments';
import {
  ItemsGrid,
  OrderEditorHeader,
  OrderInfoPanel,
  OrderItemEditModal,
  CustomerDetailsModal,
  OrderBillModal,
  SplitBillModal,
} from '@/components/Orders/OrderEditor';

export const NewOrder = () => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billLoading, setBillLoading] = useState(false);
  const [splitBillModalOpen, setSplitBillModalOpen] = useState(false);
  const [splitBillLoading, setSplitBillLoading] = useState(false);

  const { createPayment, linkPaymentToOrder } = usePayments();

  const {
    isEditMode,
    parsedOrderId,
    editingItem,
    optionToAdd,
    error,
    total,
    orderInfoItems,
    availableOptionsForEdit,
    loading,
    itemsLoading,
    businessLoading,
    initialLoadComplete,
    canWriteOrders,
    canReadOrders,
    items,
    getItemNameLocal,
    getOptionNameLocal,
    getOptionPriceLabel,
    handleItemClick,
    handleEditItem,
    handleEditSave,
    handleEditCancel,
    handleRemoveItem,
    handleAddOption,
    handleRemoveOption,
    handleAddDiscount,
    handleSaveOrder,
    confirmCancelOrder,
    handleQuantityChange,
    setOptionToAdd,
    navigateBack,
  } = useOrderEditor();

  const handleCancelOrderClick = useCallback(() => {
    setConfirmModalOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    setConfirmModalOpen(false);
    await confirmCancelOrder();
  }, [confirmCancelOrder]);

  const handleDismissConfirm = useCallback(() => {
    setConfirmModalOpen(false);
  }, []);

  const handleSaveOrderClick = useCallback(() => {
    setCustomerModalOpen(true);
  }, []);

  const handleCustomerModalSave = useCallback(
    async (details: CustomerDetails) => {
      await handleSaveOrder(details);
      setCustomerModalOpen(false);
    },
    [handleSaveOrder]
  );

  const handleCustomerModalCancel = useCallback(() => {
    setCustomerModalOpen(false);
  }, []);

  const handleGenerateBillClick = useCallback(() => {
    setBillModalOpen(true);
  }, []);

  const handleBillModalClose = useCallback(() => {
    setBillModalOpen(false);
  }, []);

  const handlePayment = useCallback(
    async (paymentType: 'Cash' | 'CreditCard' | 'GiftCard') => {
      if (!parsedOrderId) {
        void message.warning(
          'Please save the order first before processing payment.'
        );
        return;
      }

      setBillLoading(true);
      try {
        const payment = await createPayment({
          amount: total,
          type: paymentType,
          status: 'Completed',
        });

        if (payment?.id) {
          await linkPaymentToOrder(parsedOrderId, payment.id);
          void message.success('Payment processed successfully');
          setBillModalOpen(false);
          navigateBack();
        }
      } catch {
        void message.error('Failed to process payment');
      } finally {
        setBillLoading(false);
      }
    },
    [parsedOrderId, total, createPayment, linkPaymentToOrder, navigateBack]
  );

  const handleAddTip = useCallback(() => {
    void message.info('Tip feature coming soon');
  }, []);

  const handleSplitBillClick = useCallback(() => {
    setSplitBillModalOpen(true);
  }, []);

  const handleSplitBillClose = useCallback(() => {
    setSplitBillModalOpen(false);
  }, []);

  const handlePaySplitBill = useCallback(
    async (billId: number, amount: number) => {
      if (!parsedOrderId) {
        void message.warning(
          'Please save the order first before processing payment.'
        );
        return;
      }

      setSplitBillLoading(true);
      try {
        const payment = await createPayment({
          amount,
          type: 'Cash',
          status: 'Completed',
        });

        if (payment?.id) {
          await linkPaymentToOrder(parsedOrderId, payment.id);
          void message.success(`Bill ${billId} paid successfully`);
        }
      } catch {
        void message.error('Failed to process payment');
        throw new Error('Payment failed');
      } finally {
        setSplitBillLoading(false);
      }
    },
    [parsedOrderId, createPayment, linkPaymentToOrder]
  );

  if (!canWriteOrders && !canReadOrders) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="You don't have permission to view orders."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 64px - 48px)',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5',
        overflow: 'hidden',
        margin: -24,
      }}
    >
      <OrderEditorHeader onBack={navigateBack} />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: 16 }}
        />
      )}

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: 16,
          padding: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ItemsGrid
            items={items}
            loading={itemsLoading || businessLoading || !initialLoadComplete}
            onItemClick={(item) => void handleItemClick(item)}
          />
        </div>

        <OrderInfoPanel
          items={orderInfoItems}
          total={total}
          loading={loading || !initialLoadComplete}
          canWriteOrders={canWriteOrders}
          isEditMode={isEditMode}
          onEditItem={handleEditItem}
          onAddDiscount={handleAddDiscount}
          onSaveOrder={handleSaveOrderClick}
          onDoneEditing={navigateBack}
          onGenerateBill={handleGenerateBillClick}
          onGenerateSplitBill={handleSplitBillClick}
          onCancelOrder={handleCancelOrderClick}
        />
      </div>

      <OrderItemEditModal
        open={!!editingItem}
        itemName={editingItem ? getItemNameLocal(editingItem.itemId) : ''}
        quantity={editingItem?.count || 1}
        selectedOptions={editingItem?.options || []}
        availableOptions={availableOptionsForEdit}
        optionToAdd={optionToAdd}
        getOptionName={getOptionNameLocal}
        getOptionPriceLabel={getOptionPriceLabel}
        onQuantityChange={handleQuantityChange}
        onOptionToAddChange={setOptionToAdd}
        onAddOption={handleAddOption}
        onRemoveOption={handleRemoveOption}
        onSave={() => void handleEditSave()}
        onCancel={handleEditCancel}
        onRemove={() => void handleRemoveItem()}
      />

      <Modal
        title={isEditMode ? 'Cancel Order' : 'Discard Order'}
        open={confirmModalOpen}
        onOk={() => void handleConfirmCancel()}
        onCancel={handleDismissConfirm}
        okText={isEditMode ? 'Yes, cancel order' : 'Yes, discard'}
        okType="danger"
        cancelText="No"
      >
        {isEditMode
          ? 'Are you sure you want to cancel this order?'
          : 'Are you sure you want to discard this order? All items will be removed.'}
      </Modal>

      <CustomerDetailsModal
        open={customerModalOpen}
        loading={loading}
        onSave={(details) => void handleCustomerModalSave(details)}
        onCancel={handleCustomerModalCancel}
      />

      <OrderBillModal
        open={billModalOpen}
        items={orderInfoItems}
        total={total}
        loading={billLoading}
        onPayment={(type) => void handlePayment(type)}
        onAddTip={handleAddTip}
        onClose={handleBillModalClose}
      />

      <SplitBillModal
        open={splitBillModalOpen}
        items={orderInfoItems}
        total={total}
        loading={splitBillLoading}
        onPayBill={handlePaySplitBill}
        onClose={handleSplitBillClose}
      />
    </div>
  );
};
