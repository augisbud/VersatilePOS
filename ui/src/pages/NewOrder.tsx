import { useState, useCallback } from 'react';
import { Alert, Modal } from 'antd';
import { useOrderEditor } from '@/hooks/useOrderEditor';
import { ItemsGrid } from '@/components/Orders/ItemsGrid';
import { OrderEditorHeader } from '@/components/Orders/OrderEditorHeader';
import { OrderInfoPanel } from '@/components/Orders/OrderInfoPanel';
import { OrderItemEditModal } from '@/components/Orders/OrderItemEditModal';

export const NewOrder = () => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const {
    isEditMode,
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
    handleGenerateBill,
    handleGenerateSplitBill,
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
          onEditItem={handleEditItem}
          onAddDiscount={handleAddDiscount}
          onGenerateBill={() => void handleGenerateBill()}
          onGenerateSplitBill={handleGenerateSplitBill}
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
    </div>
  );
};
