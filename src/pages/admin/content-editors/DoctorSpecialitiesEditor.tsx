import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Loader2, Plus, Trash2, Save, AlertTriangle, 
  Upload, Image as ImageIcon, Edit, UserRound 
} from 'lucide-react';
import { toast } from 'sonner';
import { useDoctorSpecialities, DoctorSpeciality } from '@/hooks/useDoctorSpecialities';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const DoctorSpecialitiesEditor = () => {
  const { 
    specialities, 
    isLoading, 
    error, 
    addSpeciality, 
    updateSpeciality, 
    deleteSpeciality 
  } = useDoctorSpecialities();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialization: '', image_url: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleEditStart = (speciality: DoctorSpeciality) => {
    setEditingId(speciality.id);
    setFormData({
      name: speciality.name,
      specialization: speciality.specialization,
      image_url: speciality.image_url
    });
    setSelectedFile(null);
  };
  
  const handleEditCancel = () => {
    setEditingId(null);
    setSelectedFile(null);
  };
  
  const handleEditSave = async (id: number) => {
    setIsSubmitting(true);
    try {
      const success = await updateSpeciality(
        id, 
        { 
          name: formData.name, 
          specialization: formData.specialization 
        }, 
        selectedFile || undefined
      );
      
      if (success) {
        setEditingId(null);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Error saving speciality:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this doctor speciality?')) return;
    
    setIsSubmitting(true);
    try {
      await deleteSpeciality(id);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddSubmit = async () => {
    if (!formData.name.trim() || !formData.specialization.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!selectedFile && !formData.image_url) {
      toast.error('Please select an image');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await addSpeciality(formData, selectedFile || undefined);
      
      if (success) {
        setIsAddDialogOpen(false);
        setFormData({ name: '', specialization: '', image_url: '' });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Loading doctor specialities...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading doctor specialities</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Manage doctor profiles and specialities shown on the specialties page
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Doctor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialities.map((speciality) => (
          <Card key={speciality.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img 
                src={speciality.image_url} 
                alt={speciality.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white"
                  onClick={() => handleEditStart(speciality)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              {editingId === speciality.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Doctor Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter doctor name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Textarea
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      placeholder="Enter specialization"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Doctor Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {selectedFile && (
                      <p className="text-xs text-green-600 mt-1">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleEditSave(speciality.id)}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? (
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
              ) : (
                <>
                  <h3 className="font-semibold text-lg">{speciality.name}</h3>
                  <p className="text-gray-500">{speciality.specialization}</p>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(speciality.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {specialities.length === 0 && !isLoading && (
        <div className="text-center p-6 border border-dashed rounded-lg">
          <UserRound className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No doctor specialities found</p>
          <p className="text-sm text-gray-400 mb-4">Add a new doctor to get started</p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            variant="outline"
            className="mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="add-doctor-description">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          
          <div id="add-doctor-description" className="sr-only">Add a new doctor speciality</div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Doctor Name</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter doctor name"
              />
            </div>
            <div>
              <Label htmlFor="add-specialization">Specialization</Label>
              <Textarea
                id="add-specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                placeholder="Enter specialization"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="add-image">Doctor Image</Label>
              <Input
                id="add-image"
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-xs text-green-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleAddSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Doctor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 