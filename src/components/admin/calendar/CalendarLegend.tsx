
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CalendarLegendProps {
  items: Array<{
    color: string;
    label: string;
    description?: string;
  }>;
}

const CalendarLegend = ({ items }: CalendarLegendProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mt-4 mb-6">
      <div 
        className="flex items-center justify-between mb-2 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-medium">Calendar Legend</h3>
        <button className="text-gray-500 hover:text-gray-800">
          {isExpanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 bg-gray-50 p-3 rounded-md border">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="text-xs flex items-center hover:bg-gray-100 p-1 rounded transition-colors"
              title={item.description || item.label}
            >
              <div className={`h-3 w-3 ${item.color} rounded-full mr-1.5`}></div>
              <span>{item.label}</span>
              {item.description && (
                <span className="text-gray-500 text-[10px] ml-1">({item.description})</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarLegend;
