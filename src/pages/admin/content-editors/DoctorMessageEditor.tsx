import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDoctorMessage } from "@/hooks/useDoctorMessage";

export const DoctorMessageEditor = () => {
  const { message, refreshData } = useDoctorMessage();
  const [form, setForm] = useState({
    id: '',
    title: '',
    message_1: '',
    message_2: '',
    author: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load message data when available
  useEffect(() => {
    if (message) {
      setForm({
        id: message.id,
        title: message.title,
        message_1: message.message_1 || '',
        message_2: message.message_2 || '',
        author: message.author || ''
      });
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.message_1) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the title and first message",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_doctor_messages')
        .upsert({
          id: form.id,
          title: form.title,
          message_1: form.message_1,
          message_2: form.message_2,
          author: form.author
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Doctor's message updated successfully"
      });
      
      refreshData();
    } catch (err) {
      console.error("Error saving doctor message:", err);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Preview component to show how the message will look
  const MessagePreview = () => (
    <div className="bg-blue-50 p-6 rounded-lg mt-8">
      <div className="text-center mb-4">
        <MessageCircle className="h-8 w-8 text-eyecare mx-auto mb-2" />
        <h3 className="text-xl font-bold text-eyecare">{form.title}</h3>
      </div>
      
      <div className="text-center">
        <p className="italic text-gray-700 mb-3">"{form.message_1}"</p>
        {form.message_2 && <p className="italic text-gray-700 mb-3">"{form.message_2}"</p>}
        <p className="font-medium text-eyecare">— {form.author}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Message Title</Label>
        <Input 
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="mt-1"
          placeholder="A Message From Dr. Lehri"
        />
      </div>
      
      <div>
        <Label htmlFor="message_1">Message (First Paragraph)</Label>
        <Textarea 
          id="message_1"
          name="message_1"
          value={form.message_1}
          onChange={handleChange}
          rows={3}
          className="mt-1"
          placeholder="I believe that every patient deserves personalized care..."
        />
      </div>
      
      <div>
        <Label htmlFor="message_2">Message (Second Paragraph, Optional)</Label>
        <Textarea 
          id="message_2"
          name="message_2"
          value={form.message_2}
          onChange={handleChange}
          rows={3}
          className="mt-1"
          placeholder="Whether you're coming in for a routine check-up..."
        />
      </div>
      
      <div>
        <Label htmlFor="author">Author Name</Label>
        <Input 
          id="author"
          name="author"
          value={form.author}
          onChange={handleChange}
          className="mt-1"
          placeholder="Dr. Sanjeev Lehri"
        />
      </div>
      
      <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Message
          </>
        )}
      </Button>
      
      {/* Preview */}
      <MessagePreview />
    </div>
  );
}; 