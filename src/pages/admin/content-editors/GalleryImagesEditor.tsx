import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Loader2, Plus, Trash2, Save, AlertTriangle, 
  Upload, MoveUp, MoveDown, Image as ImageIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import { useClinicImages, ClinicImage } from '@/hooks/useClinicImages';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export const GalleryImagesEditor = () => {
  const { images, isLoading, error, updateImage, deleteImage, uploadImage, reorderImages } = useClinicImages();
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newImage, setNewImage] = useState({ title: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editData, setEditData] = useState<{[key: string]: {title: string, description: string}}>({});
  const [saving, setSaving] = useState<{[key: string]: boolean}>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize edit data from images
  const getEditData = (id: string) => {
    if (!editData[id]) {
      const image = images.find(img => img.id === id);
      if (image) {
        return { title: image.title, description: image.description };
      }
    }
    return editData[id] || { title: '', description: '' };
  };

  const handleEditStart = (id: string) => {
    setEditingImage(id);
    setEditData({
      ...editData,
      [id]: { 
        title: images.find(img => img.id === id)?.title || '',
        description: images.find(img => img.id === id)?.description || ''
      }
    });
  };

  const handleEditCancel = () => {
    setEditingImage(null);
  };

  const handleEditSave = async (id: string) => {
    setSaving({ ...saving, [id]: true });
    try {
      const data = editData[id];
      if (!data) return;

      const success = await updateImage(id, data);
      if (success) {
        toast.success('Image updated successfully!');
        setEditingImage(null);
      } else {
        toast.error('Failed to update image.');
      }
    } catch (err) {
      console.error('Error saving image:', err);
      toast.error('An error occurred while saving.');
    } finally {
      setSaving({ ...saving, [id]: false });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image from the gallery?')) return;

    setSaving({ ...saving, [id]: true });
    try {
      const success = await deleteImage(id);
      if (success) {
        toast.success('Image deleted successfully!');
      } else {
        toast.error('Failed to delete image.');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('An error occurred while deleting.');
    } finally {
      setSaving({ ...saving, [id]: false });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newImage.title.trim()) {
      toast.error('Please select a file and provide a title');
      return;
    }

    setUploading(true);
    try {
      const success = await uploadImage(selectedFile, newImage);
      if (success) {
        toast.success('Image uploaded successfully!');
        setNewImage({ title: '', description: '' });
        setSelectedFile(null);
        setIsAddDialogOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error('Failed to upload image.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('An error occurred while uploading.');
    } finally {
      setUploading(false);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    
    const newOrder = [...images];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    
    const imageIds = newOrder.map(img => img.id);
    reorderImages(imageIds);
  };

  const handleMoveDown = (index: number) => {
    if (index >= images.length - 1) return;
    
    const newOrder = [...images];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    
    const imageIds = newOrder.map(img => img.id);
    reorderImages(imageIds);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Loading gallery images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading gallery images</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gallery Images</h3>
          <p className="text-sm text-gray-500">Manage clinic gallery images displayed on the gallery page</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Image
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img 
                src={image.src} 
                alt={image.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-4">
              {editingImage === image.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`title-${image.id}`}>Title</Label>
                    <Input
                      id={`title-${image.id}`}
                      value={getEditData(image.id).title}
                      onChange={(e) => setEditData({
                        ...editData,
                        [image.id]: {...getEditData(image.id), title: e.target.value}
                      })}
                      placeholder="Enter image title"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`desc-${image.id}`}>Description</Label>
                    <Textarea
                      id={`desc-${image.id}`}
                      value={getEditData(image.id).description}
                      onChange={(e) => setEditData({
                        ...editData,
                        [image.id]: {...getEditData(image.id), description: e.target.value}
                      })}
                      placeholder="Enter image description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleEditSave(image.id)}
                      disabled={saving[image.id]}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {saving[image.id] ? (
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
                  <h3 className="text-lg font-medium mb-1">{image.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{image.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="px-2"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === images.length - 1}
                        className="px-2"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditStart(image.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(image.id)}
                        disabled={saving[image.id]}
                      >
                        {saving[image.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Image Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="add-gallery-image">
          <p id="add-gallery-image" className="sr-only">Add a new gallery image</p>
          <DialogHeader>
            <DialogTitle>Add New Gallery Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="image-file">Select Image</Label>
              <div className="mt-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/50">
                {selectedFile ? (
                  <div className="text-center space-y-2">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm">Drag and drop or click to select</p>
                    <p className="text-xs text-gray-500">JPG, PNG or GIF up to 5MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  id="image-file"
                  ref={fileInputRef}
                  accept="image/*"
                  className={selectedFile ? "hidden" : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"}
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="image-title">Title</Label>
              <Input
                id="image-title"
                value={newImage.title}
                onChange={(e) => setNewImage({...newImage, title: e.target.value})}
                placeholder="Enter image title"
              />
            </div>
            
            <div>
              <Label htmlFor="image-description">Description</Label>
              <Textarea
                id="image-description"
                value={newImage.description}
                onChange={(e) => setNewImage({...newImage, description: e.target.value})}
                placeholder="Enter image description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewImage({ title: '', description: '' });
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !newImage.title.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryImagesEditor; 