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
import { StripePaymentModal, StripePaymentResult } from '@/components/Payment';

export const NewOrder = () => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billLoading, setBillLoading] = useState(false);
  const [splitBillModalOpen, setSplitBillModalOpen] = useState(false);
  const [splitBillLoading, setSplitBillLoading] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);

  const { createPayment, linkPaymentToOrder, completePayment } = usePayments();

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
    tagsLoading,
    itemsByTagLoading,
    initialLoadComplete,
    canWriteOrders,
    canReadOrders,
    displayedItems,
    tags,
    selectedTagId,
    setSelectedTagId,
    itemsByTagError,
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
    async (result: StripePaymentResult) => {
      try {
        setStripeModalOpen(false);

        const { paymentId, status } = result;

        // Link the payment to the order
        if (parsedOrderId) {
          try {
            await linkPaymentToOrder(parsedOrderId, paymentId);

            // Complete the payment since webhooks are not configured
            if (status !== 'Completed') {
              try {
                // Add a small delay to ensure linking is processed
                await new Promise((resolve) => setTimeout(resolve, 100));
                await completePayment(paymentId);
                void message.success('Payment completed successfully!');
              } catch (completeError) {
                console.error('Failed to complete payment:', completeError);
                void message.success(
                  'Payment processed! Please refresh to see updated status.'
                );
              }
            } else {
              void message.success('Payment completed successfully!');
            }
          } catch (linkError) {
            console.error('Failed to link payment to order:', linkError);
            void message.warning(
              'Payment was processed but could not be linked to order. Please contact support.'
            );
          }
        } else {
          // No order ID - this shouldn't happen in normal flow
          void message.success('Payment processed successfully!');
        }

        navigateBack();
      } catch (err) {
        console.error('Stripe payment success handler error:', err);
        void message.error('An unexpected error occurred');
      }
    },
    [parsedOrderId, linkPaymentToOrder, completePayment, navigateBack]
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

  // State for split bill card payment
  const [splitBillCardPayment, setSplitBillCardPayment] = useState<{
    billId: number;
    amount: number;
    itemIndices: number[];
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const handlePaySplitBill = useCallback(
    async (request: {
      billId: number;
      amount: number;
      itemIndices: number[];
      paymentType: 'Cash' | 'CreditCard' | 'GiftCard';
    }) => {
      const { billId, amount, itemIndices, paymentType } = request;

      if (!parsedOrderId) {
        void message.warning(
          'Please save the order first before processing payment.'
        );
        return;
      }

      // For Card payments, we need to open the Stripe modal
      if (paymentType === 'CreditCard') {
        return new Promise<void>((resolve, reject) => {
          setSplitBillCardPayment({
            billId,
            amount,
            itemIndices,
            resolve,
            reject,
          });
          setStripeModalOpen(true);
        });
      }

      // For Cash and GiftCard, process directly
      setSplitBillLoading(true);
      try {
        const payment = await createPayment({
          amount,
          type: paymentType,
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

  // Handler for split bill card payment success
  const handleSplitBillStripeSuccess = useCallback(
    async (result: StripePaymentResult) => {
      if (!splitBillCardPayment || !parsedOrderId) {
        setStripeModalOpen(false);
        return;
      }

      const { billId, resolve } = splitBillCardPayment;

      try {
        await linkPaymentToOrder(parsedOrderId, result.paymentId);

        // Complete the payment since webhooks are not configured
        if (result.status !== 'Completed') {
          try {
            // Add a small delay to ensure linking is processed
            await new Promise((resolve) => setTimeout(resolve, 100));
            await completePayment(result.paymentId);
          } catch (completeError) {
            console.error('Failed to complete payment:', completeError);
          }
        }

        void message.success(`Bill ${billId} paid successfully with card!`);
        resolve();
      } catch {
        void message.error('Failed to link payment to order');
        splitBillCardPayment.reject(new Error('Failed to link payment'));
      } finally {
        setSplitBillCardPayment(null);
        setStripeModalOpen(false);
      }
    },
    [splitBillCardPayment, parsedOrderId, linkPaymentToOrder, completePayment]
  );

  // Handler for split bill card payment cancel
  const handleSplitBillStripeCancel = useCallback(() => {
    if (splitBillCardPayment) {
      splitBillCardPayment.reject(new Error('Payment cancelled'));
      setSplitBillCardPayment(null);
    }
    setStripeModalOpen(false);
  }, [splitBillCardPayment]);

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
          {itemsByTagError && (
            <Alert
              message="Error"
              description={itemsByTagError}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <ItemsGrid
            items={displayedItems}
            loading={
              itemsLoading ||
              businessLoading ||
              tagsLoading ||
              itemsByTagLoading ||
              !initialLoadComplete
            }
            onItemClick={(item) => void handleItemClick(item)}
            tags={tags}
            selectedTagId={selectedTagId}
            onTagChange={setSelectedTagId}
            tagsLoading={tagsLoading}
          />
        </div>

        <OrderInfoPanel
          items={orderInfoItems}
          total={total}
          loading={loading || !initialLoadComplete}
          canWriteOrders={canWriteOrders}
          isEditMode={isEditMode}
          hasOrderId={!!parsedOrderId}
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
        amount={splitBillCardPayment?.amount ?? total}
        orderId={parsedOrderId || undefined}
        onSuccess={(result) => {
          if (splitBillCardPayment) {
            void handleSplitBillStripeSuccess(result);
          } else {
            void handleStripePaymentSuccess(result);
          }
        }}
        onCancel={
          splitBillCardPayment
            ? handleSplitBillStripeCancel
            : handleStripePaymentCancel
        }
      />
    </div>
  );
};
