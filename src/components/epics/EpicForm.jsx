import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const colorOptions = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
];

export default function EpicForm({ epic, onSubmit, onCancel, selectedProject }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "todo",
    start_date: null,
    end_date: null,
    color: '#6366f1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (epic) {
      console.log("Loading epic data:", epic); // Debug log
      setFormData({
        name: epic.name || "",
        description: epic.description || "",
        status: epic.status || "todo",
        start_date: epic.start_date ? new Date(epic.start_date) : null,
        end_date: epic.end_date ? new Date(epic.end_date) : null,
        color: epic.color || '#6366f1',
      });
    }
  }, [epic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Add validation for selectedProject
    if (!selectedProject) {
      alert("Please select a project first to create an epic.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Submitting epic data:", formData); // Debug log
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting epic:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader>
        <CardTitle>{epic ? 'Edit Epic' : 'Create New Epic'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Epic Tips:</strong> Epics represent large features that will be broken down into multiple user stories. 
            Examples: "Customer Dashboard", "Payment Processing", "Mobile App Authentication". 
            Keep the name clear and outcome-focused.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Epic Name *</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              placeholder="e.g., User Authentication System"
              required 
            />
            <p className="text-xs text-slate-600">
              Use a descriptive name that clearly identifies the major feature or initiative.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the overall goal and scope of this epic. What business value will it deliver?"
              rows={4}
            />
            <p className="text-xs text-slate-600">
              Explain the business value and high-level requirements. This helps the team understand the epic's purpose.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.start_date} onSelect={(d) => handleChange("start_date", d)} />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-slate-600">Optional: When you plan to start working on this epic.</p>
            </div>

            <div className="space-y-2">
              <Label>Target End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.end_date} onSelect={(d) => handleChange("end_date", d)} />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-slate-600">Optional: Target completion date for planning purposes.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do - Not started yet</SelectItem>
                  <SelectItem value="in_progress">In Progress - Actively being worked on</SelectItem>
                  <SelectItem value="done">Done - All stories completed</SelectItem>
                  <SelectItem value="on_hold">On Hold - Temporarily paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color Theme</Label>
              <Select value={formData.color} onValueChange={(v) => handleChange("color", v)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }} /> 
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: opt.value }} /> 
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600">Choose a color to help visually organize epics.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" /> 
              {isSubmitting ? "Saving..." : (epic ? 'Update Epic' : 'Save Epic')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}