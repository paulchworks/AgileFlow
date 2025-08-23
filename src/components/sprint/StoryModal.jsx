
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Epic, Task, User } from "@/api/entities";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Plus, Trash2 } from "lucide-react";

export default function StoryModal({ story, onSubmit, onClose, selectedProject, sprints: projectSprints }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    user_story: "",
    acceptance_criteria: "",
    status: "todo",
    priority: "medium",
    story_points: 0,
    assignee: "",
    epic_id: "",
    sprint_id: ""
  });
  const [epics, setEpics] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
    loadEpics();
    if (story) {
      console.log("Loading story data:", story); // Debug log
      setFormData({
        title: story.title || "",
        description: story.description || "",
        user_story: story.user_story || "",
        acceptance_criteria: story.acceptance_criteria || "",
        status: story.status || "todo",
        priority: story.priority || "medium",
        story_points: story.story_points || 0,
        assignee: story.assignee || "",
        epic_id: story.epic_id || "",
        sprint_id: story.sprint_id || ""
      });
      loadTasks();
    } else {
      setFormData({
        title: "", 
        description: "", 
        user_story: "", 
        acceptance_criteria: "",
        status: "todo", 
        priority: "medium", 
        story_points: 0, 
        assignee: "", 
        epic_id: "",
        sprint_id: ""
      });
    }
  }, [story, selectedProject]);

  const loadUsers = async () => {
    try {
      const usersData = await User.list();
      setUsers(usersData.length > 0 ? usersData : [{ email: 'demo@user.com', full_name: 'Demo User' }]);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadEpics = async () => {
    try {
      if (selectedProject) {
        const projectEpics = await Epic.filter({ project_id: selectedProject.id });
        setEpics(projectEpics);
        console.log("Loaded epics:", projectEpics); // Debug log
      }
    } catch (error) {
      console.error("Error loading epics:", error);
    }
  };

  const loadTasks = async () => {
    try {
      if (story?.id) {
        const storyTasks = await Task.filter({ story_id: story.id });
        setTasks(storyTasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !story?.id) return;
    try {
      await Task.create({ title: newTaskTitle, story_id: story.id });
      setNewTaskTitle("");
      loadTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await Task.update(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
      loadTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      await Task.delete(taskId);
      loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Clean up the form data before submitting
      const cleanedData = {
        ...formData,
        story_points: parseInt(formData.story_points) || 0,
        assignee: formData.assignee || null,
        epic_id: formData.epic_id || null,
        sprint_id: formData.sprint_id || null,
        project_id: selectedProject?.id
      };
      
      // Auto-update status when moving to/from backlog
      if (cleanedData.sprint_id && story?.status === 'backlog') {
        cleanedData.status = 'todo';
      } else if (!cleanedData.sprint_id && story?.sprint_id) {
        cleanedData.status = 'backlog';
      }

      console.log("Submitting story data:", cleanedData); // Debug log
      await onSubmit(cleanedData);
    } catch (error) {
      console.error("Error submitting story:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    console.log("Field changed:", field, value); // Debug log
    setFormData(prev => ({ 
      ...prev, 
      [field]: value === "" ? (field === "epic_id" || field === "assignee" || field === "sprint_id" ? null : "") : value 
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {story ? "Edit Story" : "Create New Story"}
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
            <div className="space-y-2">
              <Label htmlFor="title">Story Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter story title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_story">User Story</Label>
              <Input
                id="user_story"
                value={formData.user_story}
                onChange={(e) => handleChange("user_story", e.target.value)}
                placeholder="As a [user], I want [goal] so that [benefit]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Detailed description of the story..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acceptance_criteria">Acceptance Criteria</Label>
              <Textarea
                id="acceptance_criteria"
                value={formData.acceptance_criteria}
                onChange={(e) => handleChange("acceptance_criteria", e.target.value)}
                placeholder="- Criteria 1&#10;- Criteria 2&#10;- Criteria 3"
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="story_points">Story Points</Label>
                <Select 
                  value={formData.story_points.toString()} 
                  onValueChange={(value) => handleChange("story_points", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="13">13</SelectItem>
                    <SelectItem value="21">21</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select value={formData.assignee || ''} onValueChange={(value) => handleChange("assignee", value)}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Unassigned</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.email} value={user.email}>{user.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="epic_id">Epic/Feature</Label>
                <Select 
                  value={formData.epic_id || ""}
                  onValueChange={(value) => handleChange("epic_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an epic..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>No Epic</SelectItem>
                    {epics.map(epic => (
                      <SelectItem key={epic.id} value={epic.id}>{epic.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sprint_id">Sprint</Label>
              <Select
                value={formData.sprint_id || ""}
                onValueChange={(value) => handleChange("sprint_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Move to backlog..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Backlog / No Sprint</SelectItem>
                  {projectSprints?.map(sprint => (
                    <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {story?.id && (
              <div className="space-y-4 pt-4 border-t">
                <Label className="font-semibold">Sub-Tasks</Label>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 group">
                      <Checkbox 
                        id={`task-${task.id}`}
                        checked={task.status === 'done'}
                        onCheckedChange={() => handleToggleTask(task)}
                      />
                      <label 
                        htmlFor={`task-${task.id}`}
                        className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-800'}`}
                      >
                        {task.title}
                      </label>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100" 
                        onClick={() => handleDeleteTask(task.id)}
                        type="button"
                      >
                        <Trash2 className="w-4 h-4 text-red-500"/>
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                  />
                  <Button type="button" onClick={handleAddTask}>
                    <Plus className="w-4 h-4 mr-2"/> Add
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6">
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
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : (story ? "Update" : "Create")} Story
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
