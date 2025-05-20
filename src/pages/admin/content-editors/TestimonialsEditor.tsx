import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Save, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTestimonials, Testimonial } from '@/hooks/useTestimonials';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TestimonialsEditor = () => {
  const { testimonials, isLoading, error, refreshTestimonials, updateTestimonial, addTestimonial, deleteTestimonial } = useTestimonials();
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Omit<Testimonial, 'id' | 'created_at'>>({
    author: '',
    title: '',
    quote: '',
    initials: '',
    delay: 100
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSelectTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsAdding(false);
  };

  const handleNewTestimonial = () => {
    setSelectedTestimonial(null);
    setIsAdding(true);
    setNewTestimonial({
      author: '',
      title: '',
      quote: '',
      initials: '',
      delay: 100
    });
  };

  const handleTestimonialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isAdding) {
      setNewTestimonial({
        ...newTestimonial,
        [e.target.name]: e.target.name === 'delay' ? parseInt(e.target.value, 10) : e.target.value
      });
    } else if (selectedTestimonial) {
      setSelectedTestimonial({
        ...selectedTestimonial,
        [e.target.name]: e.target.name === 'delay' ? parseInt(e.target.value, 10) : e.target.value
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdding) {
        // Generate initials if empty
        let initials = newTestimonial.initials;
        if (!initials && newTestimonial.author) {
          initials = newTestimonial.author
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase();
        }

        const success = await addTestimonial({
          ...newTestimonial,
          initials: initials || 'P' // Default to 'P' if no author name provided
        });

        if (success) {
          toast.success('Testimonial added successfully');
          setIsAdding(false);
        } else {
          toast.error('Failed to add testimonial');
        }
      } else if (selectedTestimonial) {
        const { id, ...testimonialData } = selectedTestimonial;
        const success = await updateTestimonial(id, testimonialData);

        if (success) {
          toast.success('Testimonial updated successfully');
        } else {
          toast.error('Failed to update testimonial');
        }
      }
    } catch (err) {
      toast.error('An error occurred while saving');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTestimonial) return;
    
    setSaving(true);
    try {
      const success = await deleteTestimonial(selectedTestimonial.id);
      if (success) {
        toast.success('Testimonial deleted successfully');
        setSelectedTestimonial(null);
      } else {
        toast.error('Failed to delete testimonial');
      }
    } catch (err) {
      toast.error('An error occurred while deleting');
      console.error(err);
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
          <p className="mt-2">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading testimonials</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Testimonials List */}
      <div className="col-span-1 border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Testimonials</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewTestimonial}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {testimonials.length === 0 && !isAdding ? (
          <p className="text-gray-500">No testimonials found. Click "New" to add your first one!</p>
        ) : (
          <div className="space-y-2">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                  ${selectedTestimonial?.id === testimonial.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                onClick={() => handleSelectTestimonial(testimonial)}
              >
                <div className="font-medium">{testimonial.author}</div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {testimonial.quote}
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
            onClick={refreshTestimonials}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Testimonial Editor */}
      <div className="col-span-2 border rounded-lg p-6">
        {isAdding ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="author">Author Name</Label>
              <Input 
                id="author"
                name="author"
                value={newTestimonial.author}
                onChange={handleTestimonialChange}
                placeholder="Enter author name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="title">Title/Role</Label>
              <Input 
                id="title"
                name="title"
                value={newTestimonial.title}
                onChange={handleTestimonialChange}
                placeholder="Enter title (e.g. Patient)"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="quote">Testimonial Quote</Label>
              <Textarea 
                id="quote"
                name="quote"
                value={newTestimonial.quote}
                onChange={handleTestimonialChange}
                placeholder="Enter testimonial quote"
                rows={6}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initials">Initials (Optional)</Label>
                <Input 
                  id="initials"
                  name="initials"
                  value={newTestimonial.initials}
                  onChange={handleTestimonialChange}
                  placeholder="Enter initials"
                  className="mt-1"
                  maxLength={2}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from author name</p>
              </div>
              <div>
                <Label htmlFor="delay">Animation Delay (ms)</Label>
                <Input 
                  id="delay"
                  name="delay"
                  type="number"
                  value={newTestimonial.delay}
                  onChange={handleTestimonialChange}
                  className="mt-1"
                  step={100}
                  min={0}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !newTestimonial.author || !newTestimonial.quote}
                className="bg-gynecology hover:bg-gynecology/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : selectedTestimonial ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="author">Author Name</Label>
              <Input 
                id="author"
                name="author"
                value={selectedTestimonial.author}
                onChange={handleTestimonialChange}
                placeholder="Enter author name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="title">Title/Role</Label>
              <Input 
                id="title"
                name="title"
                value={selectedTestimonial.title}
                onChange={handleTestimonialChange}
                placeholder="Enter title (e.g. Patient)"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="quote">Testimonial Quote</Label>
              <Textarea 
                id="quote"
                name="quote"
                value={selectedTestimonial.quote}
                onChange={handleTestimonialChange}
                placeholder="Enter testimonial quote"
                rows={6}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initials">Initials</Label>
                <Input 
                  id="initials"
                  name="initials"
                  value={selectedTestimonial.initials}
                  onChange={handleTestimonialChange}
                  placeholder="Enter initials"
                  className="mt-1"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="delay">Animation Delay (ms)</Label>
                <Input 
                  id="delay"
                  name="delay"
                  type="number"
                  value={selectedTestimonial.delay}
                  onChange={handleTestimonialChange}
                  className="mt-1"
                  step={100}
                  min={0}
                />
              </div>
            </div>
            
            <div className="flex justify-between gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !selectedTestimonial.author || !selectedTestimonial.quote}
                className="bg-gynecology hover:bg-gynecology/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Select a testimonial from the left to edit, or click "New" to add one</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this testimonial. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 