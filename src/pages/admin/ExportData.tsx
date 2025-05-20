
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Loader2, ArrowLeft } from 'lucide-react';

const ExportData = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [dataType, setDataType] = useState('appointments');
  const [specialty, setSpecialty] = useState('all');

  const handleExport = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from(dataType).select('*');
      
      if (dataType === 'appointments' && specialty !== 'all') {
        query = query.eq('specialty', specialty === 'eye' ? 'eyecare' : specialty);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "There is no data available for the selected options.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Convert data to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values with commas, quotes, etc.
            return typeof value === 'string' 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${dataType}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `${data.length} records exported to CSV.`,
      });
      
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Could not export the data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Export Data</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Export your data as CSV files for use in spreadsheet applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="data-type" className="text-sm font-medium">
              Data Type
            </label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger id="data-type" className="w-full">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="holidays">Holidays</SelectItem>
                <SelectItem value="content_blocks">Content Blocks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {dataType === 'appointments' && (
            <div className="space-y-2">
              <label htmlFor="specialty" className="text-sm font-medium">
                Specialty
              </label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger id="specialty" className="w-full">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="eye">Eye Care</SelectItem>
                  <SelectItem value="gynecology">Gynecology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button 
            onClick={handleExport} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportData;
