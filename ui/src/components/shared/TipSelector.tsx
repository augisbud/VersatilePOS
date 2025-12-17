import { Button, InputNumber, Typography } from 'antd';

const { Text } = Typography;

const TIP_PRESETS = [
  { label: '15%', value: 0.15 },
  { label: '18%', value: 0.18 },
  { label: '20%', value: 0.2 },
  { label: '25%', value: 0.25 },
];

interface TipSelectorProps {
  tipAmount: number;
  selectedTipPreset: number | null;
  isCustomTip: boolean;
  onPresetClick: (percentage: number) => void;
  onCustomChange: (value: number | null) => void;
  onNoTip: () => void;
}

export const TipSelector = ({
  tipAmount,
  selectedTipPreset,
  isCustomTip,
  onPresetClick,
  onCustomChange,
  onNoTip,
}: TipSelectorProps) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Add a Tip
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <InputNumber
          prefix="$"
          min={0}
          step={1}
          value={tipAmount}
          placeholder="0.00"
          onChange={onCustomChange}
          style={{ flex: 1 }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
          flexWrap: 'wrap',
        }}
      >
        {TIP_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type={selectedTipPreset === preset.value ? 'primary' : 'default'}
            onClick={() => onPresetClick(preset.value)}
            style={{
              flex: 1,
              minWidth: 60,
              fontWeight: selectedTipPreset === preset.value ? 600 : 400,
            }}
          >
            {preset.label}
          </Button>
        ))}
        <Button
          type={tipAmount === 0 && !isCustomTip ? 'primary' : 'default'}
          onClick={onNoTip}
          style={{
            flex: 1,
            minWidth: 60,
            fontWeight: tipAmount === 0 && !isCustomTip ? 600 : 400,
          }}
        >
          No Tip
        </Button>
      </div>
    </div>
  );
};
