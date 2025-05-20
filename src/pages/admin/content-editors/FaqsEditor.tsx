import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Save, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useFaqs, FAQ } from '@/hooks/useFaqs';
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

export const FaqsEditor = () => {
  const { faqs, isLoading, error, refreshFaqs, updateFaq, addFaq, deleteFaq } = useFaqs();
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState<Omit<FAQ, 'id' | 'created_at'>>({
    question: '',
    answer: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSelectFaq = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsAdding(false);
  };

  const handleNewFaq = () => {
    setSelectedFaq(null);
    setIsAdding(true);
    setNewFaq({
      question: '',
      answer: ''
    });
  };

  const handleFaqChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isAdding) {
      setNewFaq({
        ...newFaq,
        [e.target.name]: e.target.value
      });
    } else if (selectedFaq) {
      setSelectedFaq({
        ...selectedFaq,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdding) {
        const success = await addFaq(newFaq);

        if (success) {
          toast.success('FAQ added successfully');
          setIsAdding(false);
        } else {
          toast.error('Failed to add FAQ');
        }
      } else if (selectedFaq) {
        const { id, ...faqData } = selectedFaq;
        const success = await updateFaq(id, faqData);

        if (success) {
          toast.success('FAQ updated successfully');
        } else {
          toast.error('Failed to update FAQ');
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
    if (!selectedFaq) return;
    
    setSaving(true);
    try {
      const success = await deleteFaq(selectedFaq.id);
      if (success) {
        toast.success('FAQ deleted successfully');
        setSelectedFaq(null);
      } else {
        toast.error('Failed to delete FAQ');
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
          <p className="mt-2">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading FAQs</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* FAQs List */}
      <div className="col-span-1 border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">FAQs</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewFaq}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {faqs.length === 0 && !isAdding ? (
          <p className="text-gray-500">No FAQs found. Click "New" to add your first one!</p>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq) => (
              <div 
                key={faq.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                  ${selectedFaq?.id === faq.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                onClick={() => handleSelectFaq(faq)}
              >
                <div className="font-medium line-clamp-2">{faq.question}</div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {faq.answer}
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
            onClick={refreshFaqs}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* FAQ Editor */}
      <div className="col-span-2 border rounded-lg p-6">
        {isAdding ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input 
                id="question"
                name="question"
                value={newFaq.question}
                onChange={handleFaqChange}
                placeholder="Enter question"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea 
                id="answer"
                name="answer"
                value={newFaq.answer}
                onChange={handleFaqChange}
                placeholder="Enter answer"
                rows={8}
                className="mt-1"
              />
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
                disabled={saving || !newFaq.question || !newFaq.answer}
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
        ) : selectedFaq ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input 
                id="question"
                name="question"
                value={selectedFaq.question}
                onChange={handleFaqChange}
                placeholder="Enter question"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea 
                id="answer"
                name="answer"
                value={selectedFaq.answer}
                onChange={handleFaqChange}
                placeholder="Enter answer"
                rows={8}
                className="mt-1"
              />
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
                disabled={saving || !selectedFaq.question || !selectedFaq.answer}
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
            <p>Select a FAQ from the left to edit, or click "New" to add one</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this FAQ. This action cannot be undone.
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