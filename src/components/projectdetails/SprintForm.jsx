import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, X } from 'lucide-react';

export default function SprintForm({ sprint, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    start_date: null,
    end_date: null,
    capacity: 0,
  });

  useEffect(() => {
    if (sprint) {
      setFormData({
        name: sprint.name || '',
        goal: sprint.goal || '',
        start_date: sprint.start_date ? new Date(sprint.start_date) : null,
        end_date: sprint.end_date ? new Date(sprint.end_date) : null,
        capacity: sprint.capacity || 0,
      });
    }
  }, [sprint]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      capacity: Number(formData.capacity)
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader>
        <CardTitle>{sprint ? 'Edit Sprint' : 'Create New Sprint'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sprint-name">Sprint Name *</Label>
            <Input id="sprint-name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sprint-goal">Sprint Goal</Label>
            <Textarea id="sprint-goal" value={formData.goal} onChange={(e) => handleChange('goal', e.target.value)} />
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
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.start_date} onSelect={(d) => handleChange("start_date", d)} /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.end_date} onSelect={(d) => handleChange("end_date", d)} /></PopoverContent>
              </Popover>
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="sprint-capacity">Capacity (Story Points)</Label>
            <Input 
              id="sprint-capacity" 
              type="number"
              value={formData.capacity} 
              onChange={(e) => handleChange('capacity', e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" /> Cancel</Button>
            <Button type="submit"><Save className="w-4 h-4 mr-2" /> {sprint ? 'Update Sprint' : 'Save Sprint'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}