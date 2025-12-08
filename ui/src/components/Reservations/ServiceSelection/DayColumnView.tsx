import type { DayColumn, TimeSlot, SelectedSlot } from '@/types/timeSlot';
import { TimeSlotCell } from './TimeSlotCell';

interface DayColumnViewProps {
  column: DayColumn;
  selectedSlot: SelectedSlot | null;
  onSlotClick: (column: DayColumn, slot: TimeSlot) => void;
}

export const DayColumnView = ({
  column,
  selectedSlot,
  onSlotClick,
}: DayColumnViewProps) => {
  const isSlotSelected = (slot: TimeSlot) => {
    return (
      selectedSlot?.date === column.dateLabel &&
      selectedSlot?.time === slot.time
    );
  };

  return (
    <div
      style={{
        minWidth: '120px',
        flex: 1,
      }}
    >
      <div
        style={{
          border: '1px solid #d9d9d9',
          padding: '12px 16px',
          textAlign: 'center',
          fontWeight: 500,
          marginBottom: '8px',
          background: '#fafafa',
        }}
      >
        {column.dateLabel}
      </div>
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderTop: 'none',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        {column.slots.map((slot) => (
          <TimeSlotCell
            key={slot.time}
            slot={slot}
            isSelected={isSlotSelected(slot)}
            onClick={() => onSlotClick(column, slot)}
          />
        ))}
      </div>
    </div>
  );
};
