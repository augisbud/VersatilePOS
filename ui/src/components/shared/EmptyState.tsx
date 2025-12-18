import { ReactNode } from 'react';
import { Card, Typography, Button } from 'antd';
import {
  InboxOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  ShopOutlined,
  AppstoreOutlined,
  ToolOutlined,
  DollarOutlined,
  UnorderedListOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

const EMPTY_STATE_COLOR = '#3b82f6';
const EMPTY_STATE_BG = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';

export type EmptyStateVariant =
  | 'default'
  | 'items'
  | 'orders'
  | 'reservations'
  | 'business'
  | 'services'
  | 'priceModifiers'
  | 'options'
  | 'giftCards';

type Props = {
  variant?: EmptyStateVariant;
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
  icon?: ReactNode;
  compact?: boolean;
};

const variantIcons: Record<EmptyStateVariant, ReactNode> = {
  default: <InboxOutlined />,
  items: <AppstoreOutlined />,
  orders: <ShoppingCartOutlined />,
  reservations: <CalendarOutlined />,
  business: <ShopOutlined />,
  services: <ToolOutlined />,
  priceModifiers: <DollarOutlined />,
  options: <UnorderedListOutlined />,
  giftCards: <CreditCardOutlined />,
};

export const EmptyState = ({
  variant = 'default',
  title,
  description,
  actionLabel,
  onAction,
  showAction = true,
  icon,
  compact = false,
}: Props) => {
  const displayIcon = icon ?? variantIcons[variant];

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '24px 16px' : '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: compact ? 56 : 80,
          height: compact ? 56 : 80,
          borderRadius: '50%',
          background: `${EMPTY_STATE_COLOR}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: compact ? 16 : 24,
          fontSize: compact ? 24 : 36,
          color: EMPTY_STATE_COLOR,
        }}
      >
        {displayIcon}
      </div>

      {title && (
        <Title
          level={compact ? 5 : 4}
          style={{
            margin: 0,
            marginBottom: 8,
            color: '#1f2937',
            fontWeight: 600,
          }}
        >
          {title}
        </Title>
      )}

      <Text
        style={{
          color: '#6b7280',
          fontSize: compact ? 13 : 15,
          maxWidth: compact ? 280 : 320,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Text>

      {showAction && actionLabel && onAction && (
        <Button
          type="primary"
          onClick={onAction}
          size={compact ? 'small' : 'middle'}
          style={{
            marginTop: compact ? 16 : 24,
            borderRadius: 8,
            height: compact ? 32 : 40,
            paddingInline: compact ? 16 : 24,
            background: EMPTY_STATE_COLOR,
            borderColor: EMPTY_STATE_COLOR,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <Card
      style={{
        borderRadius: 16,
        background: EMPTY_STATE_BG,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {content}
    </Card>
  );
};
