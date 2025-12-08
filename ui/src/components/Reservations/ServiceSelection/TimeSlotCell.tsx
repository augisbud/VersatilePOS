import type { TimeSlot } from '@/types/timeSlot';

interface TimeSlotCellProps {
  slot: TimeSlot;
  isSelected: boolean;
  onClick: () => void;
}

export const TimeSlotCell = ({
  slot,
  isSelected,
  onClick,
}: TimeSlotCellProps) => {
  const getBackgroundColor = () => {
    if (isSelected) {
      return '#d9d9d9';
    }

    return 'transparent';
  };

  return (
    <div
      onClick={slot.isAvailable ? onClick : undefined}
      style={{
        padding: '8px 16px',
        textAlign: 'center',
        cursor: slot.isAvailable ? 'pointer' : 'default',
        borderBottom: '1px solid #f0f0f0',
        textDecoration: slot.isAvailable ? 'none' : 'line-through',
        color: slot.isAvailable ? '#000' : '#999',
        background: getBackgroundColor(),
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => {
        if (slot.isAvailable && !isSelected) {
          e.currentTarget.style.background = '#f0f0f0';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {slot.time}
    </div>
  );
};
