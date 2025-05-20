import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useDoctorGyneMessage } from '@/hooks/useDoctorGyneMessage';

export const DoctorGyneMessageEditor = () => {
  const { message, isLoading, error, refreshMessage, updateMessage } = useDoctorGyneMessage();
  const [editableMessage, setEditableMessage] = useState(message);
  const [saving, setSaving] = useState(false);

  // Update local state when the message data changes
  useEffect(() => {
    if (message) {
      setEditableMessage(message);
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editableMessage) return;
    
    setEditableMessage({
      ...editableMessage,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!editableMessage) return;
    
    setSaving(true);
    try {
      const { id, created_at, ...updateData } = editableMessage;
      const success = await updateMessage(updateData);
      
      if (success) {
        toast.success('Doctor message updated successfully');
      } else {
        toast.error('Failed to update doctor message');
      }
    } catch (err) {
      toast.error('An error occurred while saving');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
          <p className="mt-2">Loading doctor message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading doctor message</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  if (!editableMessage) {
    return (
      <div className="p-6">
        <p>No doctor message found. Please refresh the page.</p>
        <Button onClick={refreshMessage} className="mt-4">Refresh</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-6 border rounded-lg p-6">
        <div>
          <Label htmlFor="doctor_name">Doctor Name</Label>
          <Input 
            id="doctor_name"
            name="doctor_name"
            value={editableMessage.doctor_name}
            onChange={handleInputChange}
            placeholder="Full doctor name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="heading">Message Heading</Label>
          <Input 
            id="heading"
            name="heading"
            value={editableMessage.heading}
            onChange={handleInputChange}
            placeholder="Message heading"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="message_1">First Message Paragraph</Label>
          <Textarea 
            id="message_1"
            name="message_1"
            value={editableMessage.message_1}
            onChange={handleInputChange}
            placeholder="First paragraph of the doctor message"
            rows={4}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="message_2">Second Message Paragraph</Label>
          <Textarea 
            id="message_2"
            name="message_2"
            value={editableMessage.message_2}
            onChange={handleInputChange}
            placeholder="Second paragraph of the doctor message"
            rows={4}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="signature">Signature</Label>
          <Input 
            id="signature"
            name="signature"
            value={editableMessage.signature}
            onChange={handleInputChange}
            placeholder="Doctor signature"
            className="mt-1"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={refreshMessage}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !editableMessage.doctor_name || !editableMessage.message_1}
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
    </div>
  );
}; 