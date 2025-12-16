import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { DayColumn, TimeSlot, SelectedSlot } from '@/types/timeSlot';
import { DayColumnView } from './DayColumnView';
import { EmptyState } from '@/components/shared';

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
      <EmptyState
        variant="reservations"
        description="Select a service and specialist above to see available time slots."
        showAction={false}
        compact
      />
    );
  }

  if (
    dayColumns.length === 0 ||
    dayColumns.every((col) => col.slots.length === 0)
  ) {
    return (
      <EmptyState
        variant="reservations"
        title="No Availability"
        description="There are no available time slots for the selected service and specialist. Try choosing different options."
        showAction={false}
        compact
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
