import React, { useState } from "react";
import { motion } from "framer-motion";
import { SendEmail } from "@/api/integrations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, X, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InviteModal({ onClose, onInviteSent }) {
  const [formData, setFormData] = useState({
    email: "",
    role: "user"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const emailBody = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #1e293b;">You're Invited to AgileFlow!</h1>
          <p>You have been invited to join the AgileFlow project management workspace.</p>
          <p>Click the button below to sign up and get started:</p>
          <a 
            href="${window.location.origin}" 
            style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;"
          >
            Accept Invitation
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
            If you're having trouble with the button, copy and paste this URL into your browser: ${window.location.origin}
          </p>
        </div>
      `;

      await SendEmail({
        to: formData.email,
        from_name: "The AgileFlow Team",
        subject: "Your Invitation to AgileFlow",
        body: emailBody
      });

      onInviteSent();
    } catch (error) {
      console.error("Failed to send invitation:", error);
      setError(`Failed to send invitation: ${error.message || 'Unknown error'}`);
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Mail className="w-6 h-6 text-emerald-600" />
              Invite Team Member
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="colleague@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                disabled={isSubmitting || !formData.email}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}