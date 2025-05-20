
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileJson, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  specialty: string;
  reason: string;
  doctor: string;
  clinic: string;
  status: string;
  created_at: string;
  additional_info?: string | null;
  age?: number | null;
  gender?: string | null;
}

interface AppointmentExportProps {
  appointments: Appointment[];
}

const AppointmentExport: React.FC<AppointmentExportProps> = ({ appointments }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [specialtyFilter, setSpecialtyFilter] = useState<'all' | 'eyecare' | 'gynecology'>('all');
  
  const filteredAppointments = specialtyFilter === 'all' 
    ? appointments 
    : appointments.filter(appointment => appointment.specialty === specialtyFilter);
  
  const handleExport = async () => {
    if (!filteredAppointments || filteredAppointments.length === 0) {
      alert('No appointments to export');
      return;
    }
    
    setIsExporting(true);
    
    try {
      if (exportFormat === 'csv') {
        exportToCSV();
      } else {
        exportToJSON();
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportToCSV = () => {
    // CSV header
    const header = [
      'ID', 'First Name', 'Last Name', 'Email', 'Phone',
      'Date', 'Time', 'Specialty', 'Doctor', 'Clinic',
      'Status', 'Reason', 'Additional Info', 'Age', 'Gender', 'Created At'
    ].join(',');
    
    // CSV rows
    const rows = filteredAppointments.map(appt => [
      appt.id,
      `"${appt.first_name}"`,
      `"${appt.last_name}"`,
      `"${appt.email}"`,
      `"${appt.phone}"`,
      appt.date,
      appt.time,
      `"${appt.specialty}"`,
      `"${appt.doctor}"`,
      `"${appt.clinic}"`,
      appt.status,
      `"${appt.reason.replace(/"/g, '""')}"`,
      appt.additional_info ? `"${appt.additional_info.replace(/"/g, '""')}"` : '',
      appt.age || '',
      appt.gender ? `"${appt.gender}"` : '',
      appt.created_at
    ].join(','));
    
    // Combine header and rows
    const csv = [header, ...rows].join('\n');
    
    const specialtyText = specialtyFilter === 'all' ? 'all' : specialtyFilter;
    // Download file with specialty in filename
    downloadFile(csv, `appointments-${specialtyText}-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  };
  
  const exportToJSON = () => {
    const jsonData = JSON.stringify(filteredAppointments, null, 2);
    const specialtyText = specialtyFilter === 'all' ? 'all' : specialtyFilter;
    downloadFile(jsonData, `appointments-${specialtyText}-${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json');
  };
  
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h3 className="text-lg font-medium">Export Appointment Data</h3>
        <p className="text-gray-600">Download appointment records for your records or analysis.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <div className="flex space-x-2">
              <Button 
                type="button"
                variant={exportFormat === 'csv' ? 'default' : 'outline'} 
                onClick={() => setExportFormat('csv')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" /> CSV
              </Button>
              <Button 
                type="button"
                variant={exportFormat === 'json' ? 'default' : 'outline'} 
                onClick={() => setExportFormat('json')}
                className="flex-1"
              >
                <FileJson className="h-4 w-4 mr-2" /> JSON
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Specialty Filter</label>
            <div className="flex space-x-2">
              <Button 
                type="button"
                variant={specialtyFilter === 'all' ? 'default' : 'outline'} 
                onClick={() => setSpecialtyFilter('all')}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" /> All
              </Button>
              <Button 
                type="button"
                variant={specialtyFilter === 'eyecare' ? 'default' : 'outline'} 
                onClick={() => setSpecialtyFilter('eyecare')}
                className="flex-1"
              >
                Eye Care
              </Button>
              <Button 
                type="button"
                variant={specialtyFilter === 'gynecology' ? 'default' : 'outline'} 
                onClick={() => setSpecialtyFilter('gynecology')}
                className="flex-1"
              >
                Gynecology
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Download</label>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || !filteredAppointments || filteredAppointments.length === 0}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" /> Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" /> Export {filteredAppointments?.length || 0} Appointments
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border-l-4 border-blue-400">
        <h4 className="font-medium text-blue-900">About Data Exports</h4>
        <p className="text-sm mt-1 text-gray-600">
          Exported data includes all patient details, appointment times, and status information.
          This information is considered sensitive medical data - please handle accordingly.
        </p>
      </div>
    </div>
  );
};

export default AppointmentExport;
