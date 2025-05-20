import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useDoctorWhyChoose } from '@/hooks/useDoctorWhyChoose';

export const DoctorWhyChooseEditor = () => {
  const { choices, isLoading, error, updateChoice, addChoice, deleteChoice } = useDoctorWhyChoose();
  const [editingChoice, setEditingChoice] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newChoice, setNewChoice] = useState({ title: '', description: '' });
  const [editData, setEditData] = useState<{[key: string]: {title: string, description: string}}>({});
  const [saving, setSaving] = useState<{[key: string]: boolean}>({});

  // Initialize edit data from choices
  const getEditData = (id: string) => {
    if (!editData[id]) {
      const choice = choices.find(c => c.id === id);
      if (choice) {
        return { title: choice.title, description: choice.description };
      }
    }
    return editData[id] || { title: '', description: '' };
  };

  const handleEditStart = (id: string) => {
    setEditingChoice(id);
    setEditData({
      ...editData,
      [id]: { 
        title: choices.find(c => c.id === id)?.title || '',
        description: choices.find(c => c.id === id)?.description || ''
      }
    });
  };

  const handleEditCancel = () => {
    setEditingChoice(null);
  };

  const handleEditSave = async (id: string) => {
    setSaving({ ...saving, [id]: true });
    try {
      const data = editData[id];
      if (!data) return;

      const success = await updateChoice(id, data);
      if (success) {
        toast.success('Choice updated successfully!');
        setEditingChoice(null);
      } else {
        toast.error('Failed to update choice.');
      }
    } catch (err) {
      console.error('Error saving choice:', err);
      toast.error('An error occurred while saving.');
    } finally {
      setSaving({ ...saving, [id]: false });
    }
  };

  const handleAddSubmit = async () => {
    if (!newChoice.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving({ ...saving, new: true });
    try {
      const success = await addChoice(newChoice);
      if (success) {
        toast.success('Choice added successfully!');
        setNewChoice({ title: '', description: '' });
        setIsAdding(false);
      } else {
        toast.error('Failed to add choice.');
      }
    } catch (err) {
      console.error('Error adding choice:', err);
      toast.error('An error occurred while adding.');
    } finally {
      setSaving({ ...saving, new: false });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setSaving({ ...saving, [id]: true });
    try {
      const success = await deleteChoice(id);
      if (success) {
        toast.success('Choice deleted successfully!');
      } else {
        toast.error('Failed to delete choice.');
      }
    } catch (err) {
      console.error('Error deleting choice:', err);
      toast.error('An error occurred while deleting.');
    } finally {
      setSaving({ ...saving, [id]: false });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
          <p className="mt-2">Loading choices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading choices</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Doctor Benefits</h3>
          <p className="text-sm text-gray-500">Edit the "Why Choose Us" items displayed on the gynecology homepage</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="bg-gynecology hover:bg-gynecology/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Benefit
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4 border-2 border-gynecology/50">
          <h3 className="font-medium mb-3">Add New Benefit</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={newChoice.title}
                onChange={(e) => setNewChoice({...newChoice, title: e.target.value})}
                placeholder="Enter benefit title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={newChoice.description}
                onChange={(e) => setNewChoice({...newChoice, description: e.target.value})}
                placeholder="Enter benefit description"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewChoice({ title: '', description: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSubmit}
                disabled={saving.new}
                className="bg-gynecology hover:bg-gynecology/90"
              >
                {saving.new ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
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
        </Card>
      )}

      <div className="space-y-4">
        {choices.map((choice) => (
          <Card key={choice.id} className="p-4">
            {editingChoice === choice.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={getEditData(choice.id).title}
                    onChange={(e) => setEditData({
                      ...editData,
                      [choice.id]: {...getEditData(choice.id), title: e.target.value}
                    })}
                    placeholder="Enter benefit title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={getEditData(choice.id).description}
                    onChange={(e) => setEditData({
                      ...editData,
                      [choice.id]: {...getEditData(choice.id), description: e.target.value}
                    })}
                    placeholder="Enter benefit description"
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
                    onClick={() => handleEditSave(choice.id)}
                    disabled={saving[choice.id]}
                    className="bg-gynecology hover:bg-gynecology/90"
                  >
                    {saving[choice.id] ? (
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
              <div>
                <div className="flex justify-between">
                  <h3 className="font-semibold text-gynecology">{choice.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStart(choice.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(choice.id)}
                      disabled={saving[choice.id]}
                    >
                      {saving[choice.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{choice.description}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}; 