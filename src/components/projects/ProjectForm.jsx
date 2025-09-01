
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

const PROJECT_COLORS = [
  "#1e40af", "#7c3aed", "#dc2626", "#059669", "#ea580c", "#0891b2", "#be185d"
];

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "planning",
    start_date: project?.start_date || "",
    end_date: project?.end_date || "",
    team_lead: project?.team_lead || "",
    color: project?.color || PROJECT_COLORS[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fix: Update form data whenever project prop changes
  useEffect(() => {
    if (project) {
      console.log("ProjectForm: Loading project data:", project);
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "planning",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        team_lead: project.team_lead || "",
        color: project.color || PROJECT_COLORS[0]
      });
    } else {
      // Reset to defaults for new project
      setFormData({
        name: "",
        description: "",
        status: "planning",
        start_date: "",
        end_date: "",
        team_lead: "",
        color: PROJECT_COLORS[0]
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message || "Failed to save project. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    console.log(`Field ${field} changed to:`, value); // Retained for debugging purposes
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log("New form data:", newData); // Retained for debugging purposes
      return newData;
    });
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {project ? "Edit Project" : "Create New Project"}
          </CardTitle>
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
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter project name"
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your project..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="team_lead">Team Lead Email</Label>
              <Input
                id="team_lead"
                type="email"
                value={formData.team_lead}
                onChange={(e) => handleChange("team_lead", e.target.value)}
                placeholder="team-lead@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Project Color</Label>
              <div className="flex gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      formData.color === color ? 'border-slate-400 scale-110 ring-2 ring-slate-300' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange("color", color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : (project ? "Update" : "Create")} Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
