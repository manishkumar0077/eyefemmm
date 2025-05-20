import { useState, useRef, useEffect } from 'react';
import { useEyecareImages, EyecareImage } from '@/hooks/useEyecareImages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Upload, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const EyecareImagesEditor = () => {
  const { 
    images, 
    categories, 
    isLoading, 
    error, 
    currentCategory,
    setCurrentCategory,
    addImage, 
    updateImage, 
    deleteImage, 
    uploadImage,
    refreshData
  } = useEyecareImages();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<EyecareImage | null>(null);
  const [newImage, setNewImage] = useState({
    category: '',
    title: '',
    image_url: ''
  });
  const [editImage, setEditImage] = useState({
    id: 0,
    category: '',
    title: '',
    image_url: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // Log when images or category changes
  useEffect(() => {
    console.log(`EyecareImagesEditor: Images for category "${currentCategory}" loaded:`, images);
  }, [images, currentCategory]);

  // Set default category if available
  useEffect(() => {
    if (categories.length > 0 && !currentCategory) {
      console.log("EyecareImagesEditor: Setting default category:", categories[0]);
      setCurrentCategory(categories[0]);
    }
    // Initialize new image with first category
    if (categories.length > 0 && !newImage.category) {
      setNewImage(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, currentCategory]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleEditImageClick = () => {
    if (editFileInputRef.current) {
      editFileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    console.log("EyecareImagesEditor: File selected for upload:", file.name);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      console.log("EyecareImagesEditor: Image uploaded, URL:", imageUrl);
      if (imageUrl) {
        setNewImage(prev => ({ ...prev, image_url: imageUrl }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err) {
      console.error('Error handling image:', err);
      toast.error('An error occurred while uploading the image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    console.log("EyecareImagesEditor: File selected for edit:", file.name);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      console.log("EyecareImagesEditor: Updated image URL:", imageUrl);
      if (imageUrl) {
        setEditImage(prev => ({ ...prev, image_url: imageUrl }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err) {
      console.error('Error handling image:', err);
      toast.error('An error occurred while uploading the image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSubmit = async () => {
    if (!newImage.title.trim() || !newImage.category.trim() || !newImage.image_url) {
      toast.error('Please fill in all fields and upload an image');
      return;
    }

    try {
      console.log("EyecareImagesEditor: Adding new image:", newImage);
      const success = await addImage(newImage);
      if (success) {
        toast.success('Image added successfully');
        setIsAddDialogOpen(false);
        setNewImage({
          category: categories[0] || '',
          title: '',
          image_url: ''
        });
        setImagePreview(null);
        console.log("EyecareImagesEditor: Refreshing data after add");
        refreshData();
      } else {
        toast.error('Failed to add image');
      }
    } catch (err) {
      console.error('Error adding image:', err);
      toast.error('An error occurred while adding the image');
    }
  };

  const handleEditSubmit = async () => {
    if (!editImage.title.trim() || !editImage.category.trim() || !editImage.image_url) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { id, ...updates } = editImage;
      console.log(`EyecareImagesEditor: Updating image ID ${id}:`, updates);
      const success = await updateImage(id, updates);
      if (success) {
        toast.success('Image updated successfully');
        setIsEditDialogOpen(false);
        setSelectedImage(null);
        setEditImage({
          id: 0,
          category: '',
          title: '',
          image_url: ''
        });
        console.log("EyecareImagesEditor: Refreshing data after update");
        refreshData();
      } else {
        toast.error('Failed to update image');
      }
    } catch (err) {
      console.error('Error updating image:', err);
      toast.error('An error occurred while updating the image');
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        console.log(`EyecareImagesEditor: Deleting image ID ${id}`);
        const success = await deleteImage(id);
        if (success) {
          toast.success('Image deleted successfully');
          console.log("EyecareImagesEditor: Refreshing data after delete");
          refreshData();
        } else {
          toast.error('Failed to delete image');
        }
      } catch (err) {
        console.error('Error deleting image:', err);
        toast.error('An error occurred while deleting the image');
      }
    }
  };

  const handleEditClick = (image: EyecareImage) => {
    console.log("EyecareImagesEditor: Editing image:", image);
    setSelectedImage(image);
    setEditImage({
      id: image.id,
      category: image.category,
      title: image.title,
      image_url: image.image_url
    });
    setImagePreview(image.image_url);
    setIsEditDialogOpen(true);
  };

  const handleRefresh = () => {
    console.log("EyecareImagesEditor: Manual refresh triggered");
    refreshData();
    toast.success('Data refreshed');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-2">Loading eyecare images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <p className="font-semibold">Error loading eyecare images: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Eyecare Images</h2>
          <p className="text-gray-500">Manage images for different eyecare sections</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh Data
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Image
          </Button>
        </div>
      </div>

      {/* Debug Information */}
      <div className="p-4 border border-blue-200 bg-blue-50 rounded-md text-sm">
        <h3 className="font-bold mb-2">Debug Information</h3>
        <p><strong>Current Category:</strong> {currentCategory || "None"}</p>
        <p><strong>Available Categories:</strong> {categories.length > 0 ? categories.join(", ") : "None"}</p>
        <p><strong>Image Count:</strong> {images.length}</p>
        {images.length > 0 && (
          <div className="mt-2">
            <p><strong>First Image:</strong></p>
            <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(images[0], null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Category selector tabs */}
      {categories.length > 0 && (
        <Tabs
          value={currentCategory || categories[0]}
          onValueChange={(value) => {
            console.log("EyecareImagesEditor: Changing category to:", value);
            setCurrentCategory(value);
          }}
          className="w-full"
        >
          <TabsList className="mb-4 w-full flex overflow-x-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="flex-1">
                {category.charAt(0).toUpperCase() + category.slice(1)} ({images.filter(img => img.category === category).length})
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images
                  .filter(image => image.category === category)
                  .map(image => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="relative h-48 bg-gray-100">
                        <img 
                          src={image.image_url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/lovable-uploads/default-image.png";
                          }}
                        />
                      </div>
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-lg">{image.title}</CardTitle>
                        <CardDescription>Category: {image.category}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-2 flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(image)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
              
              {images.filter(image => image.category === category).length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No images found in this category</p>
                  <Button
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Image
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[485px]">
          <DialogHeader>
            <DialogTitle>Add New Eyecare Image</DialogTitle>
            <DialogDescription>
              Upload an image for the eyecare section
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={newImage.category} 
                onValueChange={(value) => setNewImage(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newImage.title}
                onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="image" className="text-right pt-2">
                Image
              </Label>
              <div className="col-span-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <div 
                  className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={handleImageClick}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full rounded-md object-cover"
                        style={{ maxHeight: '200px' }}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setNewImage(prev => ({ ...prev, image_url: '' }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload an image</p>
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleAddSubmit}
              disabled={isUploading || !newImage.title || !newImage.image_url}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[485px]">
          <DialogHeader>
            <DialogTitle>Edit Eyecare Image</DialogTitle>
            <DialogDescription>
              Update the image details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Select 
                value={editImage.category} 
                onValueChange={(value) => setEditImage(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editImage.title}
                onChange={(e) => setEditImage(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-image" className="text-right pt-2">
                Image
              </Label>
              <div className="col-span-3">
                <input
                  type="file"
                  ref={editFileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleEditFileSelect}
                />
                <div 
                  className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={handleEditImageClick}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full rounded-md object-cover"
                        style={{ maxHeight: '200px' }}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setEditImage(prev => ({ ...prev, image_url: '' }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload a new image</p>
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditSubmit}
              disabled={isUploading || !editImage.title || !editImage.image_url}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 