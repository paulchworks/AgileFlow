import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, X } from "lucide-react";
import { toast } from "sonner";

export default function InviteModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [isSending, setIsSending] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }
    setIsSending(true);

    const appUrl = window.location.origin;
    const emailBody = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #1e293b;">You're Invited to AgileFlow!</h1>
          <p>You have been invited to join the AgileFlow project management workspace.</p>
          <p>Click the button below to sign up and get started:</p>
          <a 
            href="${appUrl}" 
            style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;"
          >
            Accept Invitation
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
            If you're having trouble with the button, copy and paste this URL into your browser: ${appUrl}
          </p>
        </div>
      `;

    try {
      const { SendEmail } = await import("@/api/integrations");
      await SendEmail({
        to: email,
        from_name: "The AgileFlow Team",
        subject: "Your Invitation to AgileFlow",
        body: emailBody,
      });
      toast.success(`Invitation sent to ${email}`);
      onClose();
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error(`Failed to send invitation: ${error.message || 'An unknown error occurred.'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
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
          <DialogDescription>
            Enter the email address and assign a role to invite a new member.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleInvite} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                disabled={isSending}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}