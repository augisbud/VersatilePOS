import { Select, Typography } from 'antd';
import { ModelsServiceDto, ModelsAccountDto } from '@/api/types.gen';

const { Text } = Typography;

interface ServiceSpecialistSelectorsProps {
  services: ModelsServiceDto[];
  specialists: ModelsAccountDto[];
  selectedServiceId?: number;
  selectedSpecialistId?: number;
  onServiceChange: (serviceId: number) => void;
  onSpecialistChange: (specialistId: number) => void;
}

export const ServiceSpecialistSelectors = ({
  services,
  specialists,
  selectedServiceId,
  selectedSpecialistId,
  onServiceChange,
  onSpecialistChange,
}: ServiceSpecialistSelectorsProps) => {
  return (
    <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
      <div style={{ flex: 1 }}>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>
          Service:
        </Text>
        <Select
          placeholder="Choose service"
          value={selectedServiceId}
          onChange={onServiceChange}
          style={{ width: '100%' }}
          options={services.map((service) => ({
            value: service.id,
            label: service.name,
          }))}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>
          Specialist:
        </Text>
        <Select
          placeholder="Choose specialist"
          value={selectedSpecialistId}
          onChange={onSpecialistChange}
          disabled={!selectedServiceId || specialists.length === 0}
          style={{ width: '100%' }}
          options={specialists.map((specialist) => ({
            value: specialist.id,
            label: specialist.name,
          }))}
        />
      </div>
    </div>
  );
};
