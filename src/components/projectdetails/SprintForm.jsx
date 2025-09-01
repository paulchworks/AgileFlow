
import React, { useState } from "react";
import { Sprint } from "@/api/entities";
import { updateProjectStatus } from "@/components/utils/projectStatusUpdater";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ActivityLogger } from "../utils/activityLogger"; // Assuming this path is correct

export default function SprintForm({ sprint, project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: sprint?.name || "",
    goal: sprint?.goal || "",
    status: sprint?.status || "planning",
    start_date: sprint?.start_date || "",
    end_date: sprint?.end_date || "",
    capacity: sprint?.capacity || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Sprint name is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = "End date must be after start date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      const dataToSave = {
        ...formData,
        project_id: project.id // Ensure project_id is included
      };

      if (sprint) {
        // Editing existing sprint
        await onSubmit(dataToSave);
        await ActivityLogger.logSprintUpdated(sprint, dataToSave);
      } else {
        // Creating new sprint
        // onSubmit is expected to return the newly created sprint object, including its ID
        const result = await onSubmit(dataToSave);
        await ActivityLogger.logSprintCreated({ ...dataToSave, id: result?.id });
      }
    } catch (error) {
      console.error("Sprint form submission error:", error);
      setErrors({ submit: error.message || "Failed to save sprint. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                {sprint ? `Edit Sprint: ${sprint.name}` : "Create New Sprint"}
              </CardTitle>
              <p className="text-emerald-100 mt-1">Project: {project.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Sprint Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Sprint 1, Feature Release 2.0"
                  className={errors.name ? "border-red-300" : ""}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Sprint Goal</Label>
              <Textarea
                id="goal"
                value={formData.goal}
                onChange={(e) => handleChange("goal", e.target.value)}
                placeholder="What do you want to achieve in this sprint?"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!formData.start_date && "text-muted-foreground"} ${errors.start_date ? "border-red-300" : ""}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(new Date(formData.start_date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.start_date ? new Date(formData.start_date) : undefined}
                      onSelect={(date) => handleChange("start_date", date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.start_date && (
                  <p className="text-red-600 text-sm">{errors.start_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!formData.end_date && "text-muted-foreground"} ${errors.end_date ? "border-red-300" : ""}`}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(new Date(formData.end_date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.end_date ? new Date(formData.end_date) : undefined}
                      onSelect={(date) => handleChange("end_date", date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                      disabled={(date) => {
                        if (!formData.start_date) return false; // If start date is not set, no restriction
                        return date < new Date(formData.start_date); // Disable dates before start date
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.end_date && (
                  <p className="text-red-600 text-sm">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Sprint Capacity (Story Points)</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", parseInt(e.target.value) || 0)}
                placeholder="How many story points can your team commit to?"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : (sprint ? "Update Sprint" : "Create Sprint")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
