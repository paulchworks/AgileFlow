
import { formatDistanceToNow, formatDistance, format } from '@/lib/dates';

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Project, { Story, Sprint, Issue } from "@/api/entities";
const ProjectSvc = (typeof window !== 'undefined' && window.__AgileFlowProjectAPI) || Project;
import { 
  LayoutDashboard, 
  Folder, 
  Target, 
  List, 
  Users,
  Zap,
  TrendingUp,
  Shapes,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Clock,
  Archive
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    url: createPageUrl("Projects"),
    icon: Folder,
  },
  {
    title: "Epics",
    url: createPageUrl("Epics"),
    icon: Shapes,
  },
  {
    title: "Sprint Board",
    url: createPageUrl("SprintBoard"),
    icon: Target,
  },
  {
    title: "Backlog",
    url: createPageUrl("Backlog"),
    icon: List,
  },
  {
    title: "Issues",
    url: createPageUrl("Issues"),
    icon: AlertTriangle,
  },
  {
    title: "Team",
    url: createPageUrl("Team"),
    icon: Users,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [stats, setStats] = useState({ 
    projectsCompleted: 0, 
    totalProjects: 0,
    backlogCount: 0, 
    behindSchedule: 0,
    totalIssues: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const [allProjects, allStories, allIssues] = await Promise.all([
          Project.list(),
          Story.list(),
          Issue.list()
        ]);

        // Calculate projects completed vs total
        const completedProjects = allProjects.filter(p => p.status === 'completed').length;
        const totalProjects = allProjects.length;

        // Calculate backlog stories
        const backlogStories = allStories.filter(s => s.status === 'backlog').length;

        // Calculate projects behind schedule
        const currentDate = new Date();
        const behindScheduleCount = allProjects.filter(project => {
          if (!project.end_date || project.status === 'completed') return false;
          const endDate = new Date(project.end_date);
          return endDate < currentDate;
        }).length;

        // Total issues count
        const totalIssues = allIssues.length;
        
        setStats({
          projectsCompleted: completedProjects,
          totalProjects: totalProjects,
          backlogCount: backlogStories,
          behindSchedule: behindScheduleCount,
          totalIssues: totalIssues
        });
      } catch (error) {
        console.error("Error fetching quick stats:", error);
        setStats({ 
          projectsCompleted: 0, 
          totalProjects: 0,
          backlogCount: 0, 
          behindSchedule: 0,
          totalIssues: 0
        });
      }
      setIsLoadingStats(false);
    };

    fetchStats();
  }, [location.pathname]); // Refetch on page navigation

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          --accent-gradient: linear-gradient(135deg, #059669 0%, #047857 100%);
          --gold-accent: #f59e0b;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --card-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        /* Fix sidebar alignment issues */
        [data-sidebar] {
          position: relative !important;
        }
        
        /* Ensure proper cursor alignment */
        .sidebar-menu-button {
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          padding: 0.75rem 1rem !important;
          text-decoration: none !important;
          border-radius: 0.5rem !important;
          transition: all 0.2s ease !important;
        }
        
        .sidebar-menu-button:hover {
          transform: none !important;
        }
      `}</style>
      
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white flex flex-col">
          <SidebarHeader className="border-b border-slate-200 p-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-700">AgileFlow</h2>
                <p className="text-xs text-slate-500 font-medium">Project Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 flex-grow overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-2">
                Workspace
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link 
                            to={item.url} 
                            className={`sidebar-menu-button ${
                              isActive 
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg' 
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium ml-3">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-3 space-y-3 bg-slate-100 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Projects</span>
                    {isLoadingStats ? (
                      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="font-semibold text-slate-700">
                          {stats.projectsCompleted}/{stats.totalProjects}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Backlogs</span>
                    {isLoadingStats ? (
                      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Archive className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold text-slate-700">{stats.backlogCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Behind Schedule</span>
                    {isLoadingStats ? (
                      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span className="font-semibold text-red-600">{stats.behindSchedule}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Open Issues</span>
                    {isLoadingStats ? (
                      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span className="font-semibold text-slate-700">{stats.totalIssues}</span>
                      </div>
                    )}
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-slate-50">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">AgileFlow</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

