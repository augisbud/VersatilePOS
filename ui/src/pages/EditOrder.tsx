import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Space,
  Typography,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useItems } from '@/hooks/useItems';
import { useItemOptions } from '@/hooks/useItemOptions';
import { usePriceModifiers } from '@/hooks/usePriceModifiers';
import { useNewOrderBuilder, SelectedOrderItem } from '@/hooks/useNewOrderBuilder';
import { BusinessSelectorCard } from '@/components/Items';
import { OrderItemsGrid } from '@/components/NewOrder/OrderItemsGrid';
import { OrderSummaryCard } from '@/components/NewOrder/OrderSummaryCard';
import { OptionsModal } from '@/components/NewOrder/OptionsModal';
import { ModelsItemOptionLinkDto } from '@/api/types.gen';

type OrderFormValues = {
  customer?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceCharge?: number;
  status?: string;
  tipAmount?: number;
};

const { Title, Text } = Typography;
const ORDER_STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled'];

export const EditOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const parsedOrderId = Number(orderId);
  const [form] = Form.useForm<OrderFormValues>();
  const [hasHydratedItems, setHasHydratedItems] = useState(false);
  const [itemsFetched, setItemsFetched] = useState(false);

  const {
    orderItems,
    itemOptionsMap,
    selectedOrder,
    selectedBusinessId,
    loading,
    error,
    fetchOrderById,
    fetchItemsForOrder,
    fetchOptionsForOrderItem,
    updateOrder,
    addItemToOrder,
    updateOrderItem,
    removeItemFromOrder,
    addOptionToOrderItem,
    removeOptionFromOrderItem,
    selectBusiness,
  } = useOrders();
  const {
    businesses,
    loading: businessLoading,
    fetchAllBusinesses,
  } = useBusiness();
  const { canWriteOrders } = useUser();
  const {
    items,
    fetchItems,
    loading: itemsLoading,
  } = useItems();
  const { itemOptions, fetchItemOptions } = useItemOptions();
  const { priceModifiers, fetchPriceModifiers } = usePriceModifiers();

  const {
    state,
    filteredItems,
    selectedDetails,
    modalItemOptions,
    optionLookup,
    orderTotal,
    getOptionUnitPrice,
    setSearchTerm,
    handleAddItem,
    handleQuantityChange,
    handleRemoveItem,
    openOptionModal,
    closeOptionModal,
    setOptionCount,
    saveOptions,
    setInitialItems,
  } = useNewOrderBuilder(items, itemOptions, priceModifiers);

  const combinedLoading = loading || itemsLoading || businessLoading;

  const hydrateForm = useCallback(() => {
    if (!selectedOrder) return;

    form.setFieldsValue({
      customer: selectedOrder.customer,
      customerEmail: selectedOrder.customerEmail,
      customerPhone: selectedOrder.customerPhone,
      serviceCharge: selectedOrder.serviceCharge,
      status: selectedOrder.status,
      tipAmount: selectedOrder.tipAmount,
    });
  }, [form, selectedOrder]);

  useEffect(() => {
    void fetchAllBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!parsedOrderId || Number.isNaN(parsedOrderId)) {
      return;
    }

    let active = true;
    const run = async () => {
      setHasHydratedItems(false);
      setItemsFetched(false);

      const order = await fetchOrderById(parsedOrderId);
      const businessId = order?.businessId;

      if (businessId) {
        selectBusiness(businessId);
        await Promise.all([
          fetchItems(businessId),
          fetchItemOptions(businessId),
          fetchPriceModifiers(businessId),
        ]);
      }

      await fetchItemsForOrder(parsedOrderId);
      if (active) {
        setItemsFetched(true);
      }
    };

    void run();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedOrderId]);

  useEffect(() => {
    hydrateForm();
  }, [hydrateForm]);

  useEffect(() => {
    if (!parsedOrderId) return;

    const missing = orderItems.filter(
      (item) => item.id !== undefined && !itemOptionsMap[item.id]
    );

    missing.forEach((item) => {
      if (item.id !== undefined) {
        void fetchOptionsForOrderItem(parsedOrderId, item.id);
      }
    });
  }, [itemOptionsMap, orderItems, parsedOrderId]);

  const optionsLoadedForAllItems = useMemo(
    () =>
      orderItems.every(
        (item) => item.id === undefined || itemOptionsMap[item.id] !== undefined
      ),
    [itemOptionsMap, orderItems]
  );

  useEffect(() => {
    if (hasHydratedItems) return;
    if (!itemsFetched) return;
    if (!optionsLoadedForAllItems) return;

    const mappedItems: SelectedOrderItem[] = orderItems
      .filter((item) => item.itemId !== undefined && item.count !== undefined)
      .map((item) => {
        const optionLinks: ModelsItemOptionLinkDto[] =
          (item.id ? itemOptionsMap[item.id] : []) ?? [];
        const normalizedOptions =
          optionLinks
            .filter(
              (opt) => opt.itemOptionId !== undefined && (opt.count ?? 0) > 0
            )
            .map((opt) => ({
              itemOptionId: opt.itemOptionId as number,
              count: opt.count ?? 0,
            })) ?? [];

        return {
          itemId: item.itemId as number,
          count: item.count ?? 0,
          options: normalizedOptions.length ? normalizedOptions : undefined,
        };
      });

    setInitialItems(mappedItems);
    setHasHydratedItems(true);
  }, [
    hasHydratedItems,
    itemsFetched,
    itemOptionsMap,
    optionsLoadedForAllItems,
    orderItems,
    setInitialItems,
  ]);

  const handleCancel = () => {
    void navigate('/orders');
  };

  const syncOptionsForItem = async (
    orderItemId: number,
    desiredOptions?: { itemOptionId: number; count: number }[]
  ) => {
    if (!parsedOrderId) return;

    const desiredLookup = new Map<number, number>(
      (desiredOptions ?? []).map((opt) => [opt.itemOptionId, opt.count])
    );
    const existing = itemOptionsMap[orderItemId] ?? [];

    for (const link of existing) {
      if (link.itemOptionId === undefined || link.id === undefined) {
        continue;
      }

      const desiredCount = desiredLookup.get(link.itemOptionId);
      if (desiredCount === undefined) {
        await removeOptionFromOrderItem(parsedOrderId, orderItemId, link.id);
      } else if (desiredCount !== link.count) {
        await removeOptionFromOrderItem(parsedOrderId, orderItemId, link.id);
        await addOptionToOrderItem(parsedOrderId, orderItemId, {
          itemOptionId: link.itemOptionId,
          count: desiredCount,
        });
      }
      desiredLookup.delete(link.itemOptionId);
    }

    for (const [itemOptionId, count] of desiredLookup.entries()) {
      if (count > 0) {
        await addOptionToOrderItem(parsedOrderId, orderItemId, {
          itemOptionId,
          count,
        });
      }
    }
  };

  const syncItems = async () => {
    if (!parsedOrderId) return;

    const desiredItems = state.selectedItems;
    const existingByItemId = orderItems.reduce<Record<number, typeof orderItems[number]>>(
      (acc, item) => {
        if (item.itemId !== undefined) {
          acc[item.itemId] = item;
        }
        return acc;
      },
      {}
    );

    for (const existing of orderItems) {
      if (existing.itemId === undefined || existing.id === undefined) continue;
      const stillDesired = desiredItems.find((i) => i.itemId === existing.itemId);
      if (!stillDesired) {
        await removeItemFromOrder(parsedOrderId, existing.id);
      }
    }

    for (const desired of desiredItems) {
      const existing = existingByItemId[desired.itemId];
      if (existing?.id) {
        if (desired.count !== existing.count) {
          await updateOrderItem(parsedOrderId, existing.id, { count: desired.count });
        }
        await syncOptionsForItem(existing.id, desired.options);
      } else {
        const created = await addItemToOrder(parsedOrderId, {
          itemId: desired.itemId,
          count: desired.count,
        });
        if (created?.id) {
          await syncOptionsForItem(created.id, desired.options);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!parsedOrderId) return;

    const values = await form.validateFields();
    await updateOrder(parsedOrderId, {
      customer: values.customer || undefined,
      customerEmail: values.customerEmail || undefined,
      customerPhone: values.customerPhone || undefined,
      serviceCharge: values.serviceCharge,
      status: values.status || undefined,
      tipAmount: values.tipAmount,
    });

    await syncItems();
    void navigate('/orders');
  };

  if (!canWriteOrders) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="You don't have permission to edit orders."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          >
            Back to orders
          </Button>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Edit Order {parsedOrderId ? `#${parsedOrderId}` : ''}
            </Title>
            <Text type="secondary">
              Update order details, items, and options.
            </Text>
          </div>
        </Space>
        <Button
          type="primary"
          onClick={() => void handleSave()}
          loading={combinedLoading}
          disabled={!state.selectedItems.length || !selectedBusinessId}
        >
          Save changes
        </Button>
      </div>

      <BusinessSelectorCard
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        loading={businessLoading}
        disabled
        onChange={(businessId) => selectBusiness(businessId)}
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={15} lg={15}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Input
              placeholder="Search..."
              value={state.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={itemsLoading || !selectedBusinessId}
              allowClear
            />

            <OrderItemsGrid
              items={filteredItems}
              loading={itemsLoading}
              selectedBusinessId={selectedBusinessId}
              onAddItem={handleAddItem}
            />
          </Space>
        </Col>

        <Col xs={24} md={9} lg={9}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <OrderSummaryCard
              items={selectedDetails}
              optionLookup={optionLookup}
              orderTotal={orderTotal}
              getOptionUnitPrice={getOptionUnitPrice}
              onOpenOptions={openOptionModal}
              onRemoveItem={handleRemoveItem}
              onQuantityChange={handleQuantityChange}
              onSubmit={() => void handleSave()}
              onCancel={handleCancel}
              selectedBusinessId={selectedBusinessId}
              loading={combinedLoading}
              primaryActionLabel="Save changes"
              secondaryActionLabel="Back to orders"
            />

            <Card title="Order details">
              <Form layout="vertical" form={form} requiredMark={false}>
                <Form.Item label="Customer name" name="customer">
                  <Input placeholder="Optional" />
                </Form.Item>
                <Form.Item label="Customer email" name="customerEmail">
                  <Input type="email" placeholder="Optional" />
                </Form.Item>
                <Form.Item label="Customer phone" name="customerPhone">
                  <Input placeholder="Optional" />
                </Form.Item>
                <Form.Item label="Status" name="status">
                  <Select
                    placeholder="Select status"
                    allowClear
                    options={ORDER_STATUS_OPTIONS.map((status) => ({
                      label: status,
                      value: status,
                    }))}
                  />
                </Form.Item>
                <Form.Item label="Service charge" name="serviceCharge">
                  <InputNumber min={0} step={0.01} prefix="$" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Tip amount" name="tipAmount">
                  <InputNumber min={0} step={0.01} prefix="$" style={{ width: '100%' }} />
                </Form.Item>
              </Form>
            </Card>
          </Space>
        </Col>
      </Row>

      <OptionsModal
        open={state.optionModalOpen}
        options={modalItemOptions}
        optionCounts={state.optionCounts}
        onToggle={(optionId, checked) => setOptionCount(optionId, checked ? 1 : 0)}
        onCountChange={(optionId, value) => setOptionCount(optionId, value)}
        onSave={saveOptions}
        onCancel={closeOptionModal}
      />
    </div>
  );
};

export default EditOrder;

