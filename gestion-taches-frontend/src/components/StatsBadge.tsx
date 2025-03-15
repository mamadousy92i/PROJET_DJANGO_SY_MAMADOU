import React from 'react';

interface StatsBadgeProps {
  badge: string;
}

const StatsBadge: React.FC<StatsBadgeProps> = ({ badge }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';

  switch (badge.trim()) {
    case 'Top Performer':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'Très bon':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'Bon':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'En progrès':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      break;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {badge}
    </span>
  );
};

export default StatsBadge;