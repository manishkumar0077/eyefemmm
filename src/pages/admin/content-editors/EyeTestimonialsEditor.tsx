import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEyeTestimonials } from "@/hooks/useEyeTestimonials";

interface TestimonialForm {
  id: string;
  name: string;
  initial: string;
  role: string;
  content: string;
}

export const EyeTestimonialsEditor = () => {
  const { testimonials, refreshData } = useEyeTestimonials();
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>({
    id: '',
    name: '',
    initial: '',
    role: 'Patient',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Select a testimonial when clicked
  const handleSelectTestimonial = (id: string) => {
    const selected = testimonials.find(t => t.id === id);
    if (selected) {
      setSelectedTestimonialId(id);
      setForm({
        id: selected.id,
        name: selected.name,
        initial: selected.initial,
        role: selected.role,
        content: selected.content
      });
    }
  };

  // Add new testimonial
  const handleAddNew = () => {
    setSelectedTestimonialId(null);
    setForm({
      id: '',
      name: '',
      initial: '',
      role: 'Patient',
      content: ''
    });
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate initial from name if name is changing
    if (name === 'name' && (!form.initial || form.initial === form.name.charAt(0))) {
      setForm({
        ...form,
        name: value,
        initial: value.charAt(0)
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  };

  // Save testimonial
  const handleSave = async () => {
    if (!form.name || !form.content) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and testimonial content.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_eye_testimonials')
        .upsert({
          id: form.id || undefined,
          name: form.name,
          initial: form.initial || form.name.charAt(0),
          role: form.role || 'Patient',
          content: form.content
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Testimonial saved successfully"
      });
      
      refreshData();
      if (!form.id) {
        handleAddNew();
      }
    } catch (err) {
      console.error("Error saving testimonial:", err);
      toast({
        title: "Error",
        description: "Failed to save testimonial",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete testimonial
  const handleDelete = async () => {
    if (!form.id) return;
    
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_eye_testimonials')
        .delete()
        .eq('id', form.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Testimonial deleted successfully"
      });
      
      refreshData();
      handleAddNew();
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Testimonials List */}
      <div className="col-span-1 border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Testimonials</h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>
        
        {testimonials.length === 0 ? (
          <p className="text-gray-500">No testimonials found</p>
        ) : (
          <div className="space-y-2">
            {testimonials.map(testimonial => (
              <div 
                key={testimonial.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                  ${selectedTestimonialId === testimonial.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                onClick={() => handleSelectTestimonial(testimonial.id)}
              >
                <div className="font-medium">{testimonial.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {testimonial.content.length > 60 
                    ? `${testimonial.content.substring(0, 60)}...` 
                    : testimonial.content}
                </div>
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
      
      {/* Testimonial Editor */}
      <div className="col-span-2 border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">
          {form.id ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Patient name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="initial">Initial</Label>
            <Input 
              id="initial"
              name="initial"
              value={form.initial}
              onChange={handleChange}
              placeholder="J"
              maxLength={1}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Will be auto-generated from name if left blank
            </p>
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Input 
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Patient"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="content">Testimonial Content</Label>
            <Textarea 
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="What the patient said about Dr. Lehri..."
              rows={5}
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
                  Save Testimonial
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
