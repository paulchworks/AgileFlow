import React, { useState, useEffect } from "react";
import { Activity, User, Project } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { 
  Activity as ActivityIcon, 
  User as UserIcon, 
  Search, 
  Filter,
  FileText,
  Folder,
  Target,
  AlertTriangle,
  Zap,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const activityIcons = {
  project: Folder,
  story: FileText,
  epic: Zap,
  sprint: Calendar,
  issue: AlertTriangle,
  task: Target
};

const actionColors = {
  created: "bg-green-100 text-green-700 border-green-200",
  updated: "bg-blue-100 text-blue-700 border-blue-200",
  deleted: "bg-red-100 text-red-700 border-red-200",
  assigned: "bg-purple-100 text-purple-700 border-purple-200",
  mentioned: "bg-amber-100 text-amber-700 border-amber-200",
  status_changed: "bg-indigo-100 text-indigo-700 border-indigo-200"
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    project_id: 'all',
    entity_type: 'all',
    action: 'all',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [activitiesData, usersData, projectsData] = await Promise.all([
        Activity.list("-created_date", 100),
        User.list(),
        Project.list()
      ]);
      
      setActivities(activitiesData);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading activity data:", error);
    }
    setIsLoading(false);
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email || 'Unknown User';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const filteredActivities = activities.filter(activity => {
    const projectMatch = filters.project_id === 'all' || activity.project_id === filters.project_id;
    const entityMatch = filters.entity_type === 'all' || activity.entity_type === filters.entity_type;
    const actionMatch = filters.action === 'all' || activity.action === filters.action;
    const searchMatch = !filters.search || 
      activity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      activity.entity_name.toLowerCase().includes(filters.search.toLowerCase());
    
    return projectMatch && entityMatch && actionMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="space-y-4">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Activity Feed</h1>
          <p className="text-slate-700 text-lg">Track all workspace activity and changes</p>
        </motion.div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Select value={filters.project_id} onValueChange={(v) => setFilters(f => ({...f, project_id: v}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={filters.entity_type} onValueChange={(v) => setFilters(f => ({...f, entity_type: v}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="project">Projects</SelectItem>
                    <SelectItem value="story">Stories</SelectItem>
                    <SelectItem value="epic">Epics</SelectItem>
                    <SelectItem value="sprint">Sprints</SelectItem>
                    <SelectItem value="issue">Issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={filters.action} onValueChange={(v) => setFilters(f => ({...f, action: v}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search activities..."
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({...f, search: e.target.value}))}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredActivities.map((activity, index) => {
            const EntityIcon = activityIcons[activity.entity_type] || ActivityIcon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-slate-600 to-slate-500 text-white text-sm">
                          {getUserName(activity.created_by)[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${actionColors[activity.action]} border text-xs`}>
                            {activity.action.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1 text-slate-600">
                            <EntityIcon className="w-3 h-3" />
                            <span className="text-xs capitalize">{activity.entity_type}</span>
                          </div>
                          {activity.project_id && (
                            <Badge variant="outline" className="text-xs">
                              {getProjectName(activity.project_id)}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-slate-900 mb-1">
                          <span className="font-medium">{getUserName(activity.created_by)}</span>{' '}
                          {activity.description}
                        </p>
                        
                        <p className="text-xs text-slate-600">
                          {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <ActivityIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Activities Found</h3>
              <p className="text-slate-600">Try adjusting your filters to see more activities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}