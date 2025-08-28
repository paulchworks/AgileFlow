import React, { useState, useEffect, useMemo } from "react";
import { User, Story } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

import TeamStats from "../components/team/TeamStats";
import TeamFilters from "../components/team/TeamFilters";
import UserCard from "../components/team/UserCard";
import InviteModal from "../components/team/InviteModal";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data to showcase the component if no users are available.
const mockUsers = [
    { id: 'mock1', full_name: 'Sarah Johnson', email: 'sarah.johnson@company.com', job_title: 'Lead Developer', user_type: 'internal', skills: ['React', 'Node.js', 'GraphQL', 'AWS'], avatar_url: '/avatars/sarah.jpg' },
    { id: 'mock2', full_name: 'Mike Chen', email: 'mike.chen@company.com', job_title: 'Mobile Lead', user_type: 'internal', skills: ['Swift', 'Kotlin', 'Firebase'], avatar_url: '/avatars/mike.jpg' },
    { id: 'mock3', full_name: 'Alex Rodriguez', email: 'alex.rodriguez@company.com', job_title: 'Data Scientist', user_type: 'internal', skills: ['Python', 'TensorFlow', 'SQL'], avatar_url: '/avatars/alex.jpg' },
    { id: 'mock4', full_name: 'Transform Inc', email: 'consult@paulchworks.com', job_title: 'UI/UX Design Consultant', user_type: 'external', skills: ['Figma', 'User Research', 'Prototyping'], avatar_url: '/avatars/team.jpg' }
];

export default function Team() {
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [filters, setFilters] = useState({ type: 'all', skill: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, storiesData] = await Promise.all([
        User.list(),
        Story.list()
      ]);
      // Use mock data only if no real users are found
      setUsers(usersData.length > 0 ? usersData : mockUsers);
      setStories(storiesData);
    } catch (error) {
      console.error("Error loading team data:", error);
      setUsers(mockUsers); // Fallback to mock data on error
    }
    setIsLoading(false);
  };
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const typeMatch = filters.type === 'all' || user.user_type === filters.type;
      const skillMatch = !filters.skill || (user.skills || []).some(skill => 
        skill.toLowerCase().includes(filters.skill.toLowerCase())
      );
      return typeMatch && skillMatch;
    });
  }, [users, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Team Hub
            </h1>
            <p className="text-slate-800 text-lg">Manage and collaborate with your team members</p>
          </div>
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Team Members
          </Button>
        </motion.div>
        
        <TeamStats users={users} isLoading={isLoading} />
        <TeamFilters onFilterChange={setFilters} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="shadow-lg border-0"><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            ))
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                assignedStories={stories.filter(s => s.assignee === user.email)}
              />
            ))
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showInviteModal && (
          <InviteModal 
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}