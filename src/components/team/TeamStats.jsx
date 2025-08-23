
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, UserCheck, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamStats({ users, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="shadow-lg border-0">
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const internalCount = users.filter(u => u.user_type === 'internal').length;
  const externalCount = users.filter(u => u.user_type === 'external').length;
  const totalSkills = new Set(users.flatMap(u => u.skills || [])).size;

  const stats = [
    {
      title: "Total Members",
      value: users.length,
      icon: Users,
      color: "from-blue-600 to-blue-500"
    },
    {
      title: "Internal Team", 
      value: internalCount,
      icon: Briefcase,
      color: "from-emerald-600 to-emerald-500"
    },
    {
      title: "External Consultants",
      value: externalCount,
      icon: UserCheck,
      color: "from-purple-600 to-purple-500"
    },
    {
      title: "Unique Skills",
      value: totalSkills,
      icon: Star,
      color: "from-amber-600 to-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
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
