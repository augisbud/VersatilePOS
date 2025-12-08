import { Modal, Select, Space, Tag, Button } from 'antd';
import { UserAddOutlined, CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { ModelsServiceDto, ModelsAccountDto } from '@/api/types.gen';

interface AssignEmployeeModalProps {
  open: boolean;
  service?: ModelsServiceDto | null;
  employees: ModelsAccountDto[];
  isLoading: boolean;
  onClose: () => void;
  onAssign: (employeeId: number, serviceId: number) => Promise<unknown>;
  onUnassign: (employeeId: number, serviceId: number) => Promise<unknown>;
  onSuccess: () => void;
}

export const AssignEmployeeModal = ({
  open,
  service,
  employees,
  isLoading,
  onClose,
  onAssign,
  onUnassign,
  onSuccess,
}: AssignEmployeeModalProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignedEmployeeIds = new Set(
    service?.employees?.map((e) => e.id) ?? []
  );

  const availableEmployees = employees.filter(
    (e) => !assignedEmployeeIds.has(e.id)
  );

  const handleAssign = async () => {
    if (!selectedEmployeeId || !service?.id) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedEmployeeId, service.id);
      setSelectedEmployeeId(null);
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async (employeeId: number) => {
    if (!service?.id) return;

    setIsSubmitting(true);
    try {
      await onUnassign(employeeId, service.id);
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployeeId(null);
    onClose();
  };

  return (
    <Modal
      title={`Manage Employees - ${service?.name ?? ''}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={500}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Assigned Employees
          </div>
          {service?.employees && service.employees.length > 0 ? (
            <Space size={[4, 8]} wrap>
              {service.employees.map((employee) => (
                <Tag
                  key={employee.id}
                  closable
                  closeIcon={<CloseOutlined />}
                  onClose={(e) => {
                    e.preventDefault();
                    void handleUnassign(employee.id!);
                  }}
                >
                  {employee.name}
                </Tag>
              ))}
            </Space>
          ) : (
            <span style={{ color: '#999' }}>No employees assigned yet</span>
          )}
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Add Employee</div>
          <Space.Compact style={{ width: '100%' }}>
            <Select
              style={{ flex: 1 }}
              placeholder="Select an employee"
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              loading={isLoading}
              options={availableEmployees.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
              notFoundContent={
                availableEmployees.length === 0
                  ? 'All employees are already assigned'
                  : 'No employees found'
              }
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => void handleAssign()}
              loading={isSubmitting}
              disabled={!selectedEmployeeId}
            >
              Assign
            </Button>
          </Space.Compact>
        </div>
      </Space>
    </Modal>
  );
};
