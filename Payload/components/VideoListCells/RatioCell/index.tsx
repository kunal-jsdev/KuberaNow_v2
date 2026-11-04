'use client';

export const RatioCell: React.FC<any> = ({ cellData }) => {
  const isVertical = cellData === '9:16';
  return (
    <span
      style={{
        background: isVertical ? '#173C2B' : '#331F65E5',
        color: isVertical ? '#00DE78' : '#9368FF',
        padding: '0 10px',
        borderRadius: '99999px',
        height: '22px',
        fontSize: '12px',
        fontWeight: 400,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isVertical ? '9:16' : '16:9'}
    </span>
  );
};

export default RatioCell;
