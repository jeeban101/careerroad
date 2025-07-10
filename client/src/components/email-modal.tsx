import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send } from "lucide-react";
import { RoadmapTemplate } from "@shared/schema";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: RoadmapTemplate;
}

interface EmailData {
  email: string;
  name?: string;
}

export default function EmailModal({ isOpen, onClose, roadmap }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendEmailMutation = useMutation({
    mutationFn: async (data: EmailData) => {
      return apiRequest("POST", "/api/send-roadmap-email", {
        ...data,
        roadmapId: roadmap.id,
        roadmapTitle: roadmap.title
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Roadmap sent to your email successfully.",
      });
      setEmail("");
      setName("");
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    sendEmailMutation.mutate({ email, name });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Send Roadmap to Email</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={sendEmailMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Roadmap
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
        
        <div className="text-sm text-gray-500 mt-2">
          We'll send you a beautiful PDF of your personalized roadmap and follow up with career tips.
        </div>
      </DialogContent>
    </Dialog>
  );
}