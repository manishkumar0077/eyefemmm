
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HolidayFormProps {
  selectedDate: Date | undefined;
  selectedDoctor: string;
  onHolidayAdded: () => void;
}

const HolidayForm = ({ selectedDate, selectedDoctor, onHolidayAdded }: HolidayFormProps) => {
  const [manualHolidayName, setManualHolidayName] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addManualHoliday = async () => {
    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for the holiday.",
        variant: "destructive",
      });
      return;
    }

    if (!manualHolidayName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for the holiday.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format date properly for database
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Determine the department based on the selectedDoctor
      let department = 'general';
      if (selectedDoctor === 'eye') {
        department = 'eyecare';
      } else if (selectedDoctor === 'gynecology') {
        department = 'gynecology';
      }
      
      // Set doctor field based on selection
      const doctorValue = selectedDoctor === 'all' ? null : selectedDoctor;
      
      const { data, error } = await supabase
        .from('holidays')
        .insert({
          date: formattedDate,
          name: manualHolidayName,
          type: 'manual',
          doctor: doctorValue,
          description: holidayDescription || null,
          department
        })
        .select(); // Add .select() to get more detailed error information
        
      if (error) {
        console.error('Detailed Supabase Error:', error);
        throw error;
      }
      
      // Confirm holiday was added
      if (data) {
        console.log('Holiday added successfully:', data);
        
        setManualHolidayName('');
        setHolidayDescription('');
        
        toast({
          title: "Holiday Added",
          description: "The holiday has been successfully added to the calendar.",
        });
        
        onHolidayAdded();
      }
    } catch (error) {
      console.error("Comprehensive Error Adding Holiday:", error);
      toast({
        title: "Error",
        description: "Failed to add the holiday. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h4 className="font-medium mb-2">Add Custom Holiday</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Selected Date:</label>
          <div className="border rounded-md p-2 bg-gray-50">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Please select a date on the calendar'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Holiday Name:</label>
          <input 
            type="text"
            className="w-full border rounded-md px-3 py-2"
            placeholder="Enter holiday name"
            value={manualHolidayName}
            onChange={(e) => setManualHolidayName(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Description (optional):</label>
        <textarea
          className="w-full border rounded-md px-3 py-2"
          placeholder="Enter holiday description or reason"
          value={holidayDescription}
          onChange={(e) => setHolidayDescription(e.target.value)}
          rows={2}
        />
      </div>
      <Button 
        className="mt-4 w-full"
        onClick={addManualHoliday}
        disabled={!selectedDate || !manualHolidayName.trim() || isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Holiday'}
      </Button>
    </div>
  );
};

export default HolidayForm;
