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
import { StripePaymentModal } from '@/components/StripePaymentModal';

export const NewOrder = () => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billLoading, setBillLoading] = useState(false);
  const [splitBillModalOpen, setSplitBillModalOpen] = useState(false);
  const [splitBillLoading, setSplitBillLoading] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);

  const { createPayment, linkPaymentToOrder, fetchPayments } = usePayments();

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

      // For CreditCard, open Stripe payment modal
      if (paymentType === 'CreditCard') {
        setBillModalOpen(false);
        setStripeModalOpen(true);
        return;
      }

      // For Cash and GiftCard, process directly
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

  const handleStripePaymentSuccess = useCallback(
    async (paymentIntentId: string) => {
      try {
        setStripeModalOpen(false);
        
        // For local demos, poll for payment status
        // The payment should already be created by the payment intent creation
        const pollForPayment = async (attempts = 0): Promise<void> => {
          if (attempts > 10) {
            // After 5 seconds, give up and show warning
            void message.warning(
              'Payment processed, but linking to order may take a moment.'
            );
            navigateBack();
            return;
          }

          try {
            // Get all payments and find the one with matching payment intent ID
            const payments = await fetchPayments();
            const stripePayment = payments.find(
              (p) => (p as any).stripePaymentIntentId === paymentIntentId
            );

            if (stripePayment?.id) {
              if (parsedOrderId) {
                await linkPaymentToOrder(parsedOrderId, stripePayment.id);
                void message.success('Payment processed successfully');
                navigateBack();
              } else {
                void message.success('Payment processed successfully');
                navigateBack();
              }
            } else {
              // Payment not found yet, wait and retry
              setTimeout(() => pollForPayment(attempts + 1), 500);
            }
          } catch (err) {
            console.error('Failed to link payment:', err);
            // Retry on error
            setTimeout(() => pollForPayment(attempts + 1), 500);
          }
        };

        // Start polling immediately
        await pollForPayment();
      } catch (err) {
        console.error('Stripe payment success handler error:', err);
        void message.error('Failed to complete payment process');
      }
    },
    [parsedOrderId, linkPaymentToOrder, navigateBack, fetchPayments]
  );

  const handleStripePaymentCancel = useCallback(() => {
    setStripeModalOpen(false);
    setBillModalOpen(true);
  }, []);

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

      <StripePaymentModal
        open={stripeModalOpen}
        amount={total}
        orderId={parsedOrderId || undefined}
        onSuccess={handleStripePaymentSuccess}
        onCancel={handleStripePaymentCancel}
      />
    </div>
  );
};
