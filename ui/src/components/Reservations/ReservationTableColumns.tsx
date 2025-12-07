import type { ColumnsType } from 'antd/es/table';
import { ModelsReservationDto } from '@/api/types.gen';
import { ReservationStatusTag } from './ReservationStatusTag';

export const getReservationColumns = (): ColumnsType<ModelsReservationDto> => {
  return [
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: string) => <strong>{customer}</strong>,
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
