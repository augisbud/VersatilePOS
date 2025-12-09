import { Empty, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { DayColumn, TimeSlot, SelectedSlot } from '@/types/timeSlot';
import { DayColumnView } from './DayColumnView';

interface TimeGridProps {
  hasSelections: boolean;
  dayColumns: DayColumn[];
  selectedSlot: SelectedSlot | null;
  onSlotClick: (column: DayColumn, slot: TimeSlot) => void;
  canGoBack: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const TimeGrid = ({
  hasSelections,
  dayColumns,
  selectedSlot,
  onSlotClick,
  canGoBack,
  onPrevious,
  onNext,
}: TimeGridProps) => {
  if (!hasSelections) {
    return (
      <Empty
        description="Select service and specialist to see available times"
        style={{ padding: '48px 0' }}
      />
    );
  }

  if (
    dayColumns.length === 0 ||
    dayColumns.every((col) => col.slots.length === 0)
  ) {
    return (
      <Empty
        description="No available time slots"
        style={{ padding: '48px 0' }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <Button
        icon={<LeftOutlined />}
        onClick={onPrevious}
        disabled={!canGoBack}
      />
      <div
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          flex: 1,
        }}
      >
        {dayColumns.map((column) => (
          <DayColumnView
            key={column.dateLabel}
            column={column}
            selectedSlot={selectedSlot}
            onSlotClick={onSlotClick}
          />
        ))}
      </div>
      <Button icon={<RightOutlined />} onClick={onNext} />
    </div>
  );
};
