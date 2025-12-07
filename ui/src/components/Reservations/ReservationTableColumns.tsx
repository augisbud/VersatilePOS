import { Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { ModelsReservationDto } from '@/api/types.gen';
import { ReservationStatusTag } from './ReservationStatusTag';

const getColumnSearchProps = (): ColumnType<ModelsReservationDto> => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }: FilterDropdownProps) => (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      <Input
        placeholder="Search customer"
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
    (record.customer ?? '')
      .toLowerCase()
      .includes((value as string).toLowerCase()),
});

export const getReservationColumns = (): ColumnsType<ModelsReservationDto> => {
  return [
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: string) => <strong>{customer}</strong>,
      ...getColumnSearchProps(),
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      key: 'customerEmail',
      render: (email: string) => email || '-',
    },
    {
      title: 'Phone',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Date of Service',
      dataIndex: 'dateOfService',
      key: 'dateOfService',
      render: (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
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
      render: (length: number) => (length ? `${length} min` : '-'),
      width: 100,
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
    },
    {
      title: 'Date Placed',
      dataIndex: 'datePlaced',
      key: 'datePlaced',
      render: (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ];
};
