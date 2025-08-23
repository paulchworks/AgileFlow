
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CheckCircle, Mail } from "lucide-react";

export default function UserCard({ user, assignedStories }) {
  const activeStories = assignedStories.filter(s => s.status === 'in_progress' || s.status === 'in_review');
  const completedStories = assignedStories.filter(s => s.status === 'done');
  
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white text-center">
        <div className={`h-24 bg-gradient-to-r ${user.user_type === 'internal' ? 'from-emerald-500 to-emerald-400' : 'from-purple-500 to-purple-400'}`} />
        
        <CardContent className="p-6 pt-0">
          <Avatar className="w-24 h-24 mx-auto -mt-12 border-4 border-white shadow-lg">
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback className="text-3xl bg-slate-200 text-slate-700 font-bold">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>

          <h3 className="font-bold text-lg text-slate-900 mt-4">{user.full_name}</h3>
          <p className="text-sm text-slate-700">{user.job_title}</p>
          
          <Badge 
            variant="secondary"
            className={`mt-2 font-medium ${user.user_type === 'internal' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}
          >
            {user.user_type === 'internal' ? 'Internal' : 'External'}
          </Badge>
          
          <div className="text-left mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-800">
              <Mail className="w-4 h-4 text-slate-500" />
              <a href={`mailto:${user.email}`} className="truncate hover:underline">{user.email}</a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-800">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <span>{activeStories.length} active stories</span>
            </div>
             <div className="flex items-center gap-3 text-sm text-slate-800">
              <CheckCircle className="w-4 h-4 text-slate-500" />
              <span>{completedStories.length} completed</span>
            </div>
          </div>
          
          {user.skills && user.skills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap gap-2 justify-center">
                {user.skills.slice(0, 4).map(skill => (
                  <Badge key={skill} variant="outline" className="font-normal text-slate-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
