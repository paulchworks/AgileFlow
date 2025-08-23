

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Folder, 
  Target, 
  List, 
  Users,
  Zap,
  TrendingUp,
  Shapes,
  AlertTriangle
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

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          --accent-gradient: linear-gradient(135deg, #059669 0%, #047857 100%);
          --gold-accent: #f59e0b;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --card-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r-0 bg-gradient-to-b from-slate-900 to-slate-800">
          <SidebarHeader className="border-b border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white">AgileFlow</h2>
                <p className="text-xs text-slate-300 font-medium">Project Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider px-3 py-2 mb-2">
                Workspace
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-lg h-11 ${
                            isActive 
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg' 
                              : 'text-slate-200 hover:bg-slate-700/50 hover:text-white'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider px-3 py-2 mb-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-3 space-y-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Active Stories</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="font-semibold text-white">12</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Sprint Progress</span>
                    <span className="font-semibold text-amber-400">67%</span>
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

