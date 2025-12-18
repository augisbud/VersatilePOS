import { Input, Button, Space, Typography, Tag, Tooltip } from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import {
  ModelsReservationDto,
  ModelsServiceDto,
  ModelsAccountDto,
} from '@/api/types.gen';
import { ReservationStatusTag } from './ReservationStatusTag';
import {
  formatDateTime,
  formatDate,
  formatCurrency,
  formatDuration,
} from '@/utils/formatters';

export const calculateReservationTotal = (
  reservation: ModelsReservationDto,
  service: ModelsServiceDto | undefined
): number => {
  if (!service) return 0;

  const durationHours = (reservation.reservationLength || 60) / 60;
  const hourlyAmount = (service.hourlyPrice || 0) * durationHours;
  const serviceCharge = service.serviceCharge || 0;
  const tipAmount = reservation.tipAmount || 0;

  return hourlyAmount + serviceCharge + tipAmount;
};

export const calculateTotalPaid = (
  reservation: ModelsReservationDto
): number => {
  return (
    reservation.payments?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0
  );
};

export const calculateRemainingAmount = (
  reservation: ModelsReservationDto,
  service: ModelsServiceDto | undefined
): number => {
  const total = calculateReservationTotal(reservation, service);
  const paid = calculateTotalPaid(reservation);
  return Math.max(0, total - paid);
};

const { Text } = Typography;

interface GetColumnsOptions {
  services: ModelsServiceDto[];
  employees: ModelsAccountDto[];
  canWrite: boolean;
  onEdit: (reservation: ModelsReservationDto) => void;
  onPay: (reservation: ModelsReservationDto) => void;
}

const getColumnSearchProps = (
  field: 'customer' | 'customerEmail' | 'customerPhone'
): ColumnType<ModelsReservationDto> => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }: FilterDropdownProps) => (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      <Input
        placeholder={`Search ${field}`}
        value={selectedKeys[0]}
        onChange={(e) =>
          setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
        onPressEnter={() => confirm()}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          onClick={() => {
            clearFilters?.();
            confirm();
          }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
  ),
  onFilter: (value, record) =>
    (record[field] ?? '')
      .toLowerCase()
      .includes((value as string).toLowerCase()),
});

export const getReservationColumns = ({
  services,
  employees,
  canWrite,
  onEdit,
  onPay,
}: GetColumnsOptions): ColumnsType<ModelsReservationDto> => {
  const getServiceName = (serviceId: number | undefined) => {
    if (!serviceId) {
      return '-';
    }

    const service = services.find((s) => s.id === serviceId);

    return service?.name || `Service #${serviceId}`;
  };

  const getSpecialistName = (accountId: number | undefined) => {
    if (!accountId) {
      return '-';
    }

    const employee = employees.find((e) => e.id === accountId);

    return employee?.name || `Employee #${accountId}`;
  };

  const columns: ColumnsType<ModelsReservationDto> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: string, record) => (
        <div>
          <Text strong>{customer || '-'}</Text>
          {record.customerEmail && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.customerEmail}
              </Text>
            </div>
          )}
          {record.customerPhone && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.customerPhone}
              </Text>
            </div>
          )}
        </div>
      ),
      ...getColumnSearchProps('customer'),
    },
    {
      title: 'Service',
      dataIndex: 'serviceId',
      key: 'serviceId',
      render: (serviceId: number) => getServiceName(serviceId),
      filters: services.map((s) => ({ text: s.name || '', value: s.id || 0 })),
      onFilter: (value, record) => record.serviceId === value,
    },
    {
      title: 'Specialist',
      dataIndex: 'accountId',
      key: 'accountId',
      render: (accountId: number) => getSpecialistName(accountId),
      filters: employees.map((e) => ({ text: e.name || '', value: e.id || 0 })),
      onFilter: (value, record) => record.accountId === value,
    },
    {
      title: 'Date & Time',
      dataIndex: 'dateOfService',
      key: 'dateOfService',
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => {
        const dateA = a.dateOfService ? new Date(a.dateOfService).getTime() : 0;
        const dateB = b.dateOfService ? new Date(b.dateOfService).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'Duration',
      dataIndex: 'reservationLength',
      key: 'reservationLength',
      render: (length: number) => formatDuration(length),
      width: 90,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <ReservationStatusTag status={status} />,
      filters: [
        { text: 'Confirmed', value: 'Confirmed' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Cancelled', value: 'Cancelled' },
        { text: 'No Show', value: 'NoShow' },
      ],
      onFilter: (value, record) => record.status === value,
      width: 110,
    },
    {
      title: 'Payment',
      key: 'payment',
      render: (_, record) => {
        const service = services.find((s) => s.id === record.serviceId);
        const totalAmount = calculateReservationTotal(record, service);
        const totalPaid = calculateTotalPaid(record);
        const remaining = calculateRemainingAmount(record, service);

        if (remaining <= 0 && totalPaid > 0) {
          return (
            <Tooltip title={`Paid: ${formatCurrency(totalPaid)}`}>
              <Tag icon={<CheckCircleOutlined />} color="success">
                Paid
              </Tag>
            </Tooltip>
          );
        }

        if (totalPaid > 0 && remaining > 0) {
          return (
            <Tooltip
              title={`Total: ${formatCurrency(totalAmount)} | Paid: ${formatCurrency(totalPaid)}`}
            >
              <Tag icon={<ClockCircleOutlined />} color="warning">
                {formatCurrency(remaining)} left
              </Tag>
            </Tooltip>
          );
        }

        if (totalAmount > 0) {
          return (
            <Tooltip title={`Total due: ${formatCurrency(totalAmount)}`}>
              <Tag icon={<ExclamationCircleOutlined />} color="default">
                {formatCurrency(totalAmount)}
              </Tag>
            </Tooltip>
          );
        }

        return <Tag color="default">-</Tag>;
      },
      width: 120,
    },
    {
      title: 'Placed',
      dataIndex: 'datePlaced',
      key: 'datePlaced',
      render: (date: string) => formatDate(date),
      sorter: (a, b) => {
        const dateA = a.datePlaced ? new Date(a.datePlaced).getTime() : 0;
        const dateB = b.datePlaced ? new Date(b.datePlaced).getTime() : 0;
        return dateA - dateB;
      },
      width: 120,
    },
  ];

  if (canWrite) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => {
        const service = services.find((s) => s.id === record.serviceId);
        const remaining = calculateRemainingAmount(record, service);
        const isFullyPaid = remaining <= 0;
        const isPayable =
          record.status === 'Confirmed' || record.status === 'Completed';

        return (
          <Space size="small">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              Edit
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => onPay(record)}
              disabled={isFullyPaid || !isPayable}
            >
              Pay
            </Button>
          </Space>
        );
      },
    });
  }

  return columns;
};
