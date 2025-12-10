import { Checkbox, InputNumber, List, Modal, Space, Typography } from 'antd';
import { ModelsItemOptionDto } from '@/api/types.gen';

type Props = {
  open: boolean;
  options: ModelsItemOptionDto[];
  optionCounts: Record<number, number>;
  onToggle: (optionId: number, checked: boolean) => void;
  onCountChange: (optionId: number, value: number) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const OptionsModal = ({
  open,
  options,
  optionCounts,
  onToggle,
  onCountChange,
  onSave,
  onCancel,
}: Props) => (
  <Modal open={open} onCancel={onCancel} onOk={onSave} okText="Save" title="Choose item options">
    {!options.length ? (
      <Typography.Text type="secondary">
        No options available for this item.
      </Typography.Text>
    ) : (
      <List
        dataSource={options}
        renderItem={(opt) => (
          <List.Item>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Checkbox
                checked={(optionCounts[opt.id ?? 0] ?? 0) > 0}
                onChange={(e) => onToggle(opt.id ?? 0, e.target.checked)}
              >
                {opt.name || `Option #${opt.id}`}
              </Checkbox>
              <InputNumber
                min={1}
                value={optionCounts[opt.id ?? 0] ?? 0}
                onChange={(value) => onCountChange(opt.id ?? 0, value ?? 0)}
                disabled={!(optionCounts[opt.id ?? 0] ?? 0)}
              />
            </Space>
          </List.Item>
        )}
      />
    )}
  </Modal>
);


