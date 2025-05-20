import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDoctorQualifications, Qualification } from "@/hooks/useDoctorQualifications";

interface QualificationForm {
  id: string;
  title: string;
  description: string;
}

export const DoctorQualificationsEditor = () => {
  const { qualifications, refreshData } = useDoctorQualifications();
  const [selectedQualId, setSelectedQualId] = useState<string | null>(null);
  const [form, setForm] = useState<QualificationForm>({
    id: '',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Select a qualification when clicked
  const handleSelectQual = (id: string) => {
    const selected = qualifications.find(q => q.id === id);
    if (selected) {
      setSelectedQualId(id);
      setForm({
        id: selected.id,
        title: selected.degree || selected.title || '',
        description: selected.institution || selected.description || ''
      });
    }
  };

  // Add new qualification
  const handleAddNew = () => {
    setSelectedQualId(null);
    setForm({
      id: '',
      title: '',
      description: ''
    });
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  // Save qualification
  const handleSave = async () => {
    if (!form.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the qualification.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create data object to be saved
      const qualificationData: any = {
        title: form.title,
        description: form.description
      };
      
      let error;
      
      if (form.id && form.id.trim() !== '') {
        // If we have an ID, update the existing record
        const { error: updateError } = await supabase
          .from('csm_doctor_qualifications')
          .update(qualificationData)
          .eq('id', form.id);
          
        error = updateError;
      } else {
        // For new records, insert without an ID
        const { error: insertError } = await supabase
          .from('csm_doctor_qualifications')
          .insert(qualificationData);
          
        error = insertError;
      }
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Qualification saved successfully"
      });
      
      refreshData();
      if (!form.id) {
        handleAddNew();
      }
    } catch (err) {
      console.error("Error saving qualification:", err);
      toast({
        title: "Error",
        description: "Failed to save qualification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete qualification
  const handleDelete = async () => {
    if (!form.id) return;
    
    if (!confirm("Are you sure you want to delete this qualification?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_doctor_qualifications')
        .delete()
        .eq('id', form.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Qualification deleted successfully"
      });
      
      refreshData();
      handleAddNew();
    } catch (err) {
      console.error("Error deleting qualification:", err);
      toast({
        title: "Error",
        description: "Failed to delete qualification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Qualifications List */}
      <div className="col-span-1 border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Qualifications</h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>
        
        {qualifications.length === 0 ? (
          <p className="text-gray-500">No qualifications found</p>
        ) : (
          <div className="space-y-2">
            {qualifications.map(qual => (
              <div 
                key={qual.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                  ${selectedQualId === qual.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                onClick={() => handleSelectQual(qual.id)}
              >
                <div className="font-medium">{qual.degree || qual.title}</div>
                {(qual.institution || qual.description) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {(qual.institution || qual.description)?.length > 60 
                      ? `${(qual.institution || qual.description)?.substring(0, 60)}...` 
                      : (qual.institution || qual.description)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={refreshData}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Qualification Editor */}
      <div className="col-span-2 border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">
          {form.id ? 'Edit Qualification' : 'Add New Qualification'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Degree/Title</Label>
            <Input 
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., MBBS"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Institution/Description</Label>
            <Textarea 
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g., All India Institute of Medical Sciences"
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Qualification
                </>
              )}
            </Button>
            
            {form.id && (
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 