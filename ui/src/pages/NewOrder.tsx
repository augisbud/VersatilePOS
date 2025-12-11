import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, Input, InputNumber, Row, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useOrders } from '@/hooks/useOrders';
import { useBusiness } from '@/hooks/useBusiness';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useItems } from '@/hooks/useItems';
import { useItemOptions } from '@/hooks/useItemOptions';
import { usePriceModifiers } from '@/hooks/usePriceModifiers';
import { useNewOrderBuilder } from '@/hooks/useNewOrderBuilder';
import { getUserBusinessId } from '@/selectors/user';
import { ModelsCreateOrderRequest } from '@/api/types.gen';
import { BusinessSelectorCard } from '@/components/Items';
import { OrderItemsGrid } from '@/components/NewOrder/OrderItemsGrid';
import { OrderSummaryCard } from '@/components/NewOrder/OrderSummaryCard';
import { OptionsModal } from '@/components/NewOrder/OptionsModal';

const { Title } = Typography;

export const NewOrder = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<{
    customer?: string;
    customerEmail?: string;
    customerPhone?: string;
    serviceCharge?: number;
    tipAmount?: number;
  }>();

  const {
    createOrder,
    selectedBusinessId,
    selectBusiness,
    loading,
    error,
    addItemToOrder,
    addOptionToOrderItem,
  } = useOrders();
  const {
    businesses,
    loading: businessLoading,
    fetchAllBusinesses,
  } = useBusiness();
  const { canWriteOrders } = useUser();
  const { items, fetchItems, loading: itemsLoading } = useItems();
  const { itemOptions, fetchItemOptions } = useItemOptions();
  const { priceModifiers, fetchPriceModifiers } = usePriceModifiers();
  const userBusinessId = useAppSelector(getUserBusinessId);

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
  } = useNewOrderBuilder(items, itemOptions, priceModifiers);

  useEffect(() => {
    void fetchAllBusinesses();
  }, []);

  useEffect(() => {
    if (!businesses.length) {
      return;
    }

    const fallbackBusinessId =
      selectedBusinessId ?? userBusinessId ?? businesses[0].id;

    if (fallbackBusinessId && fallbackBusinessId !== selectedBusinessId) {
      selectBusiness(fallbackBusinessId);
    }
  }, [businesses, selectedBusinessId, userBusinessId]);

  useEffect(() => {
    if (selectedBusinessId) {
      void fetchItems(selectedBusinessId);
      void fetchItemOptions(selectedBusinessId);
      void fetchPriceModifiers(selectedBusinessId);
    }
    // Deliberately omit fetch callbacks from deps to avoid recreating them each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusinessId]);

  const handleCancel = () => {
    void navigate('/orders');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!selectedBusinessId || !state.selectedItems.length) {
      return;
    }

    const payload: ModelsCreateOrderRequest = {
      businessId: selectedBusinessId,
      customer: values.customer || undefined,
      customerEmail: values.customerEmail || undefined,
      customerPhone: values.customerPhone || undefined,
      serviceCharge: values.serviceCharge,
      tipAmount: values.tipAmount,
    };

    const created = await createOrder(payload);
    if (!created?.id) {
      return;
    }

    for (const item of state.selectedItems) {
      const createdOrderItem = await addItemToOrder(created.id, {
        itemId: item.itemId,
        count: item.count,
      });

      if (createdOrderItem?.id && item.options?.length) {
        for (const option of item.options) {
          await addOptionToOrderItem(created.id, createdOrderItem.id, {
            itemOptionId: option.itemOptionId,
            count: option.count,
          });
        }
      }
    }

    void navigate('/orders');
  };

  if (!canWriteOrders) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="You don't have permission to create orders."
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
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Create New Order
          </Title>
          <Typography.Text type="secondary">
            Build a new order by searching and adding items.
          </Typography.Text>
        </div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
        >
          Back to orders
        </Button>
      </div>

      <BusinessSelectorCard
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        loading={businessLoading}
        onChange={(businessId) => selectBusiness(businessId)}
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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
              onSubmit={() => void handleSubmit()}
              onCancel={handleCancel}
              selectedBusinessId={selectedBusinessId}
              loading={loading}
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

export default NewOrder;
