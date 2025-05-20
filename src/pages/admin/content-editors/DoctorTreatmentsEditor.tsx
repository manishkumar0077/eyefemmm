import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Save, Trash2, X, MoveUp, MoveDown, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useDoctorTreatments, DoctorTreatment } from '@/hooks/useDoctorTreatments';
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

export const DoctorTreatmentsEditor = () => {
  const { treatments, isLoading, error, refreshTreatments, updateTreatment, addTreatment, deleteTreatment } = useDoctorTreatments();
  const [selectedTreatment, setSelectedTreatment] = useState<DoctorTreatment | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTreatment, setNewTreatment] = useState<Omit<DoctorTreatment, 'id' | 'created_at'>>({
    title: '',
    description: '',
    bullet_points: [''],
    button_text: 'Schedule Consultation'
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectTreatment = (treatment: DoctorTreatment) => {
    setSelectedTreatment(treatment);
    setIsAdding(false);
    setImagePreview(treatment.image_url || null);
    setImageFile(null);
  };

  const handleNewTreatment = () => {
    setSelectedTreatment(null);
    setIsAdding(true);
    setNewTreatment({
      title: '',
      description: '',
      bullet_points: [''],
      button_text: 'Schedule Consultation'
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleTreatmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isAdding) {
      setNewTreatment({
        ...newTreatment,
        [e.target.name]: e.target.value
      });
    } else if (selectedTreatment) {
      setSelectedTreatment({
        ...selectedTreatment,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleBulletPointChange = (index: number, value: string) => {
    if (isAdding) {
      const updatedPoints = [...newTreatment.bullet_points];
      updatedPoints[index] = value;
      setNewTreatment({
        ...newTreatment,
        bullet_points: updatedPoints
      });
    } else if (selectedTreatment) {
      const updatedPoints = [...selectedTreatment.bullet_points];
      updatedPoints[index] = value;
      setSelectedTreatment({
        ...selectedTreatment,
        bullet_points: updatedPoints
      });
    }
  };

  const addBulletPoint = () => {
    if (isAdding) {
      setNewTreatment({
        ...newTreatment,
        bullet_points: [...newTreatment.bullet_points, '']
      });
    } else if (selectedTreatment) {
      setSelectedTreatment({
        ...selectedTreatment,
        bullet_points: [...selectedTreatment.bullet_points, '']
      });
    }
  };

  const removeBulletPoint = (index: number) => {
    if (isAdding) {
      const updatedPoints = [...newTreatment.bullet_points];
      updatedPoints.splice(index, 1);
      setNewTreatment({
        ...newTreatment,
        bullet_points: updatedPoints.length ? updatedPoints : ['']
      });
    } else if (selectedTreatment) {
      const updatedPoints = [...selectedTreatment.bullet_points];
      updatedPoints.splice(index, 1);
      setSelectedTreatment({
        ...selectedTreatment,
        bullet_points: updatedPoints.length ? updatedPoints : ['']
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (selectedTreatment) {
      setSelectedTreatment({
        ...selectedTreatment,
        image_url: undefined
      });
    } else if (isAdding) {
      setNewTreatment({
        ...newTreatment,
        image_url: undefined
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdding) {
        // Make sure there are no empty bullet points
        const filteredPoints = newTreatment.bullet_points.filter(point => point.trim() !== '');
        if (filteredPoints.length === 0) {
          filteredPoints.push('• New point');
        }

        const success = await addTreatment({
          ...newTreatment,
          bullet_points: filteredPoints
        }, imageFile || undefined);

        if (success) {
          toast.success('Treatment added successfully');
          setIsAdding(false);
          setImageFile(null);
        } else {
          toast.error('Failed to add treatment');
        }
      } else if (selectedTreatment) {
        // Make sure there are no empty bullet points
        const filteredPoints = selectedTreatment.bullet_points.filter(point => point.trim() !== '');
        if (filteredPoints.length === 0) {
          filteredPoints.push('• New point');
        }

        const { id, ...treatmentData } = selectedTreatment;
        const success = await updateTreatment(id, {
          ...treatmentData,
          bullet_points: filteredPoints
        }, imageFile || undefined);

        if (success) {
          toast.success('Treatment updated successfully');
          setImageFile(null);
        } else {
          toast.error('Failed to update treatment');
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
    if (!selectedTreatment) return;
    
    setSaving(true);
    try {
      const success = await deleteTreatment(selectedTreatment.id);
      if (success) {
        toast.success('Treatment deleted successfully');
        setSelectedTreatment(null);
      } else {
        toast.error('Failed to delete treatment');
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
          <p className="mt-2">Loading treatments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading treatments</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Treatments List */}
      <div className="col-span-1 border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Treatments</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewTreatment}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {treatments.length === 0 && !isAdding ? (
          <p className="text-gray-500">No treatments found. Click "New" to add your first one!</p>
        ) : (
          <div className="space-y-2">
            {treatments.map((treatment) => (
              <div 
                key={treatment.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                  ${selectedTreatment?.id === treatment.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                onClick={() => handleSelectTreatment(treatment)}
              >
                <div className="font-medium">{treatment.title}</div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {treatment.description}
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
            onClick={refreshTreatments}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Treatment Editor */}
      <div className="col-span-2 border rounded-lg p-6">
        {isAdding ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Treatment Title</Label>
              <Input 
                id="title"
                name="title"
                value={newTreatment.title}
                onChange={handleTreatmentChange}
                placeholder="Enter treatment title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={newTreatment.description}
                onChange={handleTreatmentChange}
                placeholder="Enter treatment description"
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="treatment-image">Treatment Image</Label>
              <div className="mt-2 flex items-center">
                <div 
                  className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md w-32 h-24 mr-6 flex-shrink-0 relative cursor-pointer group"
                  onClick={handleImageClick}
                >
                  {imagePreview || (selectedTreatment?.image_url && !isAdding) ? (
                    <>
                      <img 
                        src={imagePreview || (selectedTreatment?.image_url || '')}
                        alt="Treatment Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/lovable-uploads/default-image.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  {(imagePreview || (selectedTreatment?.image_url && !isAdding)) && (
                    <button 
                      type="button"
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="treatment-image"
                />
                
                <div>
                  <p className="text-sm text-gray-500">
                    Click to upload an image. Recommended size: 800x600 pixels.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="button_text">Button Text</Label>
              <Input 
                id="button_text"
                name="button_text"
                value={newTreatment.button_text}
                onChange={handleTreatmentChange}
                placeholder="Enter button text"
                className="mt-1"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Bullet Points</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addBulletPoint}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Point
                </Button>
              </div>
              
              <div className="space-y-2">
                {newTreatment.bullet_points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={point}
                      onChange={(e) => handleBulletPointChange(index, e.target.value)}
                      placeholder="Enter bullet point"
                      className="flex-grow"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBulletPoint(index)}
                      disabled={newTreatment.bullet_points.length <= 1}
                      className="flex-shrink-0 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                disabled={saving}
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
        ) : selectedTreatment ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Treatment Title</Label>
              <Input 
                id="title"
                name="title"
                value={selectedTreatment.title}
                onChange={handleTreatmentChange}
                placeholder="Enter treatment title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={selectedTreatment.description}
                onChange={handleTreatmentChange}
                placeholder="Enter treatment description"
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="treatment-image">Treatment Image</Label>
              <div className="mt-2 flex items-center">
                <div 
                  className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md w-32 h-24 mr-6 flex-shrink-0 relative cursor-pointer group"
                  onClick={handleImageClick}
                >
                  {imagePreview || (selectedTreatment?.image_url && !isAdding) ? (
                    <>
                      <img 
                        src={imagePreview || (selectedTreatment?.image_url || '')}
                        alt="Treatment Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/lovable-uploads/default-image.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  {(imagePreview || (selectedTreatment?.image_url && !isAdding)) && (
                    <button 
                      type="button"
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="treatment-image"
                />
                
                <div>
                  <p className="text-sm text-gray-500">
                    Click to upload an image. Recommended size: 800x600 pixels.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="button_text">Button Text</Label>
              <Input 
                id="button_text"
                name="button_text"
                value={selectedTreatment.button_text}
                onChange={handleTreatmentChange}
                placeholder="Enter button text"
                className="mt-1"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Bullet Points</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addBulletPoint}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Point
                </Button>
              </div>
              
              <div className="space-y-2">
                {selectedTreatment.bullet_points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={point}
                      onChange={(e) => handleBulletPointChange(index, e.target.value)}
                      placeholder="Enter bullet point"
                      className="flex-grow"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBulletPoint(index)}
                      disabled={selectedTreatment.bullet_points.length <= 1}
                      className="flex-shrink-0 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                disabled={saving}
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
            <p>Select a treatment from the left to edit, or click "New" to add one</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this treatment. This action cannot be undone.
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