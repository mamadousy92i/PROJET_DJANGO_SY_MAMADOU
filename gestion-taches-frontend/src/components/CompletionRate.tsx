import React from 'react';

interface CompletionRateProps {
  rate: number;
}

const CompletionRate: React.FC<CompletionRateProps> = ({ rate }) => {
  const getColorClass = () => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-blue-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-200 rounded-full w-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${getColorClass()}`} 
        style={{ width: `${rate}%` }}
      ></div>
      <span className="inline-block mt-1 font-medium text-xs">{rate}%</span>
    </div>
  );
};

export default CompletionRate;