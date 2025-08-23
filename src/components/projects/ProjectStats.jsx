
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Clock, CheckCircle, PauseCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectStats({ projects, stories, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: Target,
      color: "from-blue-600 to-blue-500"
    },
    {
      title: "Active Projects", 
      value: projects.filter(p => p.status === 'active').length,
      icon: Clock,
      color: "from-emerald-600 to-emerald-500"
    },
    {
      title: "Completed Projects",
      value: projects.filter(p => p.status === 'completed').length, 
      icon: CheckCircle,
      color: "from-purple-600 to-purple-500"
    },
    {
      title: "On Hold",
      value: projects.filter(p => p.status === 'on_hold').length,
      icon: PauseCircle,
      color: "from-amber-600 to-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="shadow-lg border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-slate-800">{stat.title}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
