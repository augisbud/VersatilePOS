import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Descriptions,
  Spin,
  Alert,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useBusiness } from '@/hooks/useBusiness';
import { ModelsCreateBusinessRequest } from '@/api/types.gen';

const { Title, Text } = Typography;

export const Business = () => {
  const { business, businessExists, loading, error, createBusiness } =
    useBusiness();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  // If business exists, show management view
  // If not, show creation form
  const showCreateForm = !businessExists;

  const handleCreateBusiness = async (values: ModelsCreateBusinessRequest) => {
    setSubmitError(undefined);
    try {
      await createBusiness(values);
      form.resetFields();
      setIsEditing(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to create business'
      );
    }
  };

  const handleEdit = () => {
    if (business) {
      form.setFieldsValue({
        name: business.name,
        email: business.email,
        phone: business.phone,
        address: business.address,
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    form.resetFields();
    setIsEditing(false);
    setSubmitError(undefined);
  };

  if (loading && !business) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading business information..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {showCreateForm || isEditing ? (
        <Card
          title={
            <Space>
              <ShopOutlined />
              <Title level={3} style={{ margin: 0 }}>
                {showCreateForm ? 'Create Your Business' : 'Edit Business'}
              </Title>
            </Space>
          }
        >
          {showCreateForm && (
            <Alert
              message="Welcome!"
              description="Let's set up your business profile. This information will be used throughout the system."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {(error || submitError) && (
            <Alert
              message="Error"
              description={error || submitError}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 24 }}
              onClose={() => setSubmitError(undefined)}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              void handleCreateBusiness(values as ModelsCreateBusinessRequest);
            }}
            autoComplete="off"
            size="large"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Business Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your business name',
                    },
                    {
                      min: 2,
                      message: 'Business name must be at least 2 characters',
                    },
                  ]}
                >
                  <Input
                    prefix={<ShopOutlined />}
                    placeholder="e.g., Joe's Coffee Shop"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter business email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="business@example.com"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter business phone number',
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="+1 (555) 123-4567"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter business address',
                    },
                  ]}
                >
                  <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={<ShopOutlined />}
                >
                  {showCreateForm ? 'Create Business' : 'Save Changes'}
                </Button>
                {!showCreateForm && (
                  <Button size="large" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card
            title={
              <Space>
                <ShopOutlined />
                <Title level={3} style={{ margin: 0 }}>
                  Business Information
                </Title>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Edit Business
              </Button>
            }
          >
            {business && (
              <>
                <Descriptions
                  bordered
                  column={{ xs: 1, sm: 1, md: 2 }}
                  size="middle"
                >
                  <Descriptions.Item
                    label={
                      <Space>
                        <ShopOutlined />
                        <Text strong>Business Name</Text>
                      </Space>
                    }
                  >
                    <Text>{business.name}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space>
                        <MailOutlined />
                        <Text strong>Email</Text>
                      </Space>
                    }
                  >
                    <Text copyable>{business.email}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space>
                        <PhoneOutlined />
                        <Text strong>Phone</Text>
                      </Space>
                    }
                  >
                    <Text copyable>{business.phone}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space>
                        <EnvironmentOutlined />
                        <Text strong>Address</Text>
                      </Space>
                    }
                  >
                    <Text>{business.address}</Text>
                  </Descriptions.Item>
                </Descriptions>

                {business.ownerAccount && (
                  <>
                    <Divider>Owner Information</Divider>
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 1, md: 2 }}
                      size="middle"
                    >
                      <Descriptions.Item
                        label={
                          <Space>
                            <UserOutlined />
                            <Text strong>Owner Name</Text>
                          </Space>
                        }
                      >
                        <Text>{business.ownerAccount.name}</Text>
                      </Descriptions.Item>

                      <Descriptions.Item
                        label={
                          <Space>
                            <UserOutlined />
                            <Text strong>Username</Text>
                          </Space>
                        }
                      >
                        <Text>{business.ownerAccount.username}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                )}
              </>
            )}
          </Card>

          {/* Future management sections can be added here */}
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Quick Actions
              </Title>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">
                More business management features coming soon!
              </Text>
              <Space wrap>
                <Button disabled>Manage Employees</Button>
                <Button disabled>Business Settings</Button>
                <Button disabled>Reports & Analytics</Button>
              </Space>
            </Space>
          </Card>
        </Space>
      )}
    </div>
  );
};
