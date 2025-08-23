import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ProjectDetailHeader({ project, onAddSprint }) {
  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
              <Badge variant="secondary" className="capitalize">{project.status}</Badge>
            </div>
            <p className="text-slate-700 max-w-2xl">{project.description}</p>
          </div>
          <Button 
            onClick={onAddSprint}
            className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Sprint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}