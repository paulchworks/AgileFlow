
import React, { useState, useEffect, useMemo } from "react";
import { Project, Sprint } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { GanttChart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Roadmap() {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [centerDate, setCenterDate] = useState(new Date()); // Reference date for the timeline

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [projectsData, sprintsData] = await Promise.all([
          Project.list(),
          Sprint.list()
        ]);
        setProjects(projectsData);
        setSprints(sprintsData);
      } catch (error) {
        console.error("Error loading roadmap data:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const { dateRange, totalDays, monthHeaders, todayOffset } = useMemo(() => {
    // Create a 6-month window: 3 months before and 3 months after the center date
    const startDate = startOfMonth(subMonths(centerDate, 3));
    const endDate = endOfMonth(addMonths(centerDate, 3));
    const totalDays = differenceInDays(endDate, startDate) + 1;

    const months = {};
    eachDayOfInterval({ start: startDate, end: endDate }).forEach(day => {
      const monthKey = format(day, 'yyyy-MM');
      if (!months[monthKey]) {
        months[monthKey] = { name: format(day, "MMM yy"), days: 0 };
      }
      months[monthKey].days++;
    });
    
    const today = new Date();
    const todayOffset = (differenceInDays(today, startDate) / totalDays) * 100;

    return { 
      dateRange: { start: startDate, end: endDate }, 
      totalDays,
      monthHeaders: Object.values(months),
      todayOffset: todayOffset >= 0 && todayOffset <= 100 ? todayOffset : null
    };
  }, [centerDate]);
  
  const getSprintPosition = (sprint) => {
    const sprintStart = new Date(sprint.start_date);
    const sprintEnd = new Date(sprint.end_date);
    
    const offset = (differenceInDays(sprintStart, dateRange.start) / totalDays) * 100;
    const width = Math.max((differenceInDays(sprintEnd, sprintStart) + 1) / totalDays * 100, 2); // Minimum 2% width

    return { left: `${offset}%`, width: `${width}%` };
  };

  // Filter sprints that are visible in the current date range
  const visibleSprints = sprints.filter(sprint => {
    const sprintStart = new Date(sprint.start_date);
    const sprintEnd = new Date(sprint.end_date);
    return sprintStart <= dateRange.end && sprintEnd >= dateRange.start;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-1/4 mb-8" />
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const projectsWithSprints = projects.filter(p => visibleSprints.some(s => s.project_id === p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg shadow-lg">
            <GanttChart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Project Roadmap</h1>
            <p className="text-slate-700 text-lg">Timeline overview of all sprints across projects</p>
          </div>
        </div>

        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: '1000px' }}>
              {/* Timeline Header */}
              <div className="flex border-b-2 border-slate-200 bg-slate-50">
                <div className="w-64 p-4 font-bold text-slate-800 border-r border-slate-200 sticky left-0 bg-slate-50 z-20">
                  Projects
                </div>
                <div className="flex-1 relative">
                  <div className="flex h-12">
                    {monthHeaders.map((month, index) => (
                      <div 
                        key={index} 
                        className="flex-shrink-0 border-r border-slate-200 flex items-center justify-center font-semibold text-slate-700 bg-slate-50 text-sm"
                        style={{ width: `${(month.days / totalDays) * 100}%` }}
                      >
                        {month.name}
                      </div>
                    ))}
                  </div>
                  
                  {/* Today Line */}
                  {todayOffset !== null && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${todayOffset}%` }}
                    >
                      <div className="absolute -top-6 -translate-x-1/2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded whitespace-nowrap">
                        Today
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Rows */}
              {projectsWithSprints.length === 0 ? (
                <div className="text-center py-16">
                  <GanttChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No Sprints Found</h3>
                  <p className="text-slate-600">Create sprints within your projects to see them on the roadmap.</p>
                </div>
              ) : (
                projectsWithSprints.map(project => {
                  const projectSprints = visibleSprints.filter(s => s.project_id === project.id);
                  
                  return (
                    <div key={project.id} className="flex border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
                      {/* Project Name Column */}
                      <div className="w-64 flex-shrink-0 p-4 border-r border-slate-200 bg-white sticky left-0 z-20">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: project.color }}
                          />
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{project.name}</h4>
                            <p className="text-xs text-slate-600">{projectSprints.length} sprint{projectSprints.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Timeline Column */}
                      <div className="flex-1 relative h-16">
                        {projectSprints.map(sprint => {
                          const { left, width } = getSprintPosition(sprint);
                          const statusConfig = {
                            active: { opacity: '100', border: 'solid', shadow: 'shadow-lg' },
                            completed: { opacity: '80', border: 'solid', shadow: 'shadow-md' },
                            planning: { opacity: '60', border: 'dashed', shadow: 'shadow-sm' }
                          }[sprint.status] || { opacity: '60', border: 'solid', shadow: 'shadow-sm' };

                          return (
                            <div
                              key={sprint.id}
                              className={`absolute top-3 h-10 rounded-lg transition-all duration-200 hover:scale-105 hover:z-30 cursor-pointer group ${statusConfig.shadow}`}
                              style={{ 
                                left, 
                                width,
                                backgroundColor: `${project.color}${statusConfig.opacity === '100' ? 'E6' : statusConfig.opacity === '80' ? 'CC' : '99'}`,
                                border: `2px ${statusConfig.border} ${project.color}50`
                              }}
                            >
                              {/* Sprint Label */}
                              <div className="px-3 py-1 text-sm font-medium text-white truncate h-full flex items-center">
                                {sprint.name}
                              </div>
                              
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-72 p-4 bg-slate-900 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-40">
                                <div className="font-bold text-base mb-2" style={{ color: project.color }}>{sprint.name}</div>
                                <div className="mb-2 text-slate-300">{project.name}</div>
                                {sprint.goal && <p className="mb-2 text-slate-200">{sprint.goal}</p>}
                                <div className="flex justify-between text-xs text-slate-400">
                                  <span>{format(new Date(sprint.start_date), "MMM d, yyyy")}</span>
                                  <span>→</span>
                                  <span>{format(new Date(sprint.end_date), "MMM d, yyyy")}</span>
                                </div>
                                <div className="text-xs mt-2">
                                  <span className={`inline-block px-2 py-1 rounded text-white ${
                                    sprint.status === 'active' ? 'bg-emerald-600' :
                                    sprint.status === 'completed' ? 'bg-blue-600' : 'bg-amber-600'
                                  }`}>
                                    {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                                  </span>
                                </div>
                                <Link to={createPageUrl(`SprintBoard?project=${project.id}&sprint=${sprint.id}`)} className="mt-3 block">
                                  <Button variant="secondary" size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white">
                                    View Board <ArrowRight className="w-3 h-3 ml-2" />
                                  </Button>
                                </Link>
                                
                                {/* Tooltip Arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}