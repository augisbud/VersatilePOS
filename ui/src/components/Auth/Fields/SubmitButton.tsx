import { Button, Form } from 'antd';

interface SubmitButtonProps {
  label: string;
  loading: boolean;
  className?: string;
}

export const SubmitButton = ({
  label,
  loading,
  className,
}: SubmitButtonProps) => (
  <Form.Item className={className} style={{ paddingTop: '24px' }}>
    <Button type="primary" htmlType="submit" loading={loading} block>
      {label}
    </Button>
  </Form.Item>
);
