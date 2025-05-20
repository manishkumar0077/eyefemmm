import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Holiday {
  id: string;
  date: Date;
  name: string;
  type: 'national' | 'doctor' | 'manual' | 'api';
  doctor?: string | null;
  description?: string | null;
}

interface HolidayListProps {
  holidays: Holiday[];
  selectedDoctor: string;
  onHolidayDeleted: () => void;
  isLoading: boolean;
}

const HolidayList = ({ holidays, selectedDoctor, onHolidayDeleted, isLoading }: HolidayListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteHoliday = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Holiday Removed",
        description: "The holiday has been successfully removed from the calendar."
      });
      
      onHolidayDeleted();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast({
        title: "Error",
        description: "Failed to delete the holiday. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHolidays = holidays.filter(holiday => 
    selectedDoctor === 'all' || 
    holiday.doctor === null || 
    holiday.doctor === selectedDoctor
  );

  return (
    <div>
      <h4 className="font-medium mb-2">Holiday Calendar</h4>
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 mx-auto text-gray-400 mb-2 border-2 border-t-primary rounded-full"></div>
          <p className="text-sm text-gray-600">Loading holidays...</p>
        </div>
      ) : filteredHolidays.length === 0 ? (
        <div className="text-center py-4 border rounded-md">
          <div className="h-6 w-6 mx-auto text-gray-400 mb-2">🗓️</div>
          <p className="text-sm text-gray-600">No holidays configured</p>
          <p className="text-xs text-gray-500 mt-1">National holidays will appear here automatically</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Date</th>
                  <th scope="col" className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Holiday</th>
                  <th scope="col" className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Type</th>
                  <th scope="col" className="px-3 py-2 text-xs font-medium text-gray-500 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHolidays
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((holiday) => (
                    <tr key={holiday.id}>
                      <td className="px-3 py-2 text-xs">{format(holiday.date, 'MMM d, yyyy')}</td>
                      <td className="px-3 py-2">
                        <div className="text-xs font-medium">{holiday.name}</div>
                        {holiday.description && (
                          <div className="text-[10px] text-gray-500">{holiday.description}</div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          holiday.type === 'national' || holiday.type === 'api' 
                            ? 'bg-blue-100 text-blue-800' 
                            : holiday.type === 'manual'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {holiday.type === 'api' ? 'national' : holiday.type}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {holiday.type === 'manual' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            className="h-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            disabled={deletingId === holiday.id}
                          >
                            {deletingId === holiday.id ? (
                              <div className="h-3 w-3 border-2 border-t-red-600 rounded-full animate-spin"></div>
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayList;
