'use client';

export const SourceCell: React.FC<any> = ({ cellData }) => {
  const isUpload = cellData === 'upload';
  return (
    <span
      style={{
        background: isUpload ? '#3771C8' : '#FF0033CC',
        color: '#FFFFFF',
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
        textTransform: 'capitalize',
      }}
    >
      {isUpload ? 'Upload' : 'YouTube'}
    </span>
  );
};

export default SourceCell;
