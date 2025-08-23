import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsCard({ title, value, icon: Icon, color, trend, isLoading }) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
        
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">{title}</p>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {value}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0 relative z-10">
          <p className="text-xs text-slate-700 font-medium">
            {trend}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}