import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  const IconComponent = icon;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`rounded-full p-3`} style={{ backgroundColor: `${color}1A` }}>
        <IconComponent size={24} style={{ color: color }} />
      </div>
    </div>
  );
};

export default StatCard;
