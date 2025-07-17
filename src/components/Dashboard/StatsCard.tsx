import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

export default function StatsCard({ title, value, change, changeType, icon: Icon }: StatsCardProps) {
  const getChangeColor = () => {
    if (!changeType) return 'text-gray-500';
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${getChangeColor()}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}