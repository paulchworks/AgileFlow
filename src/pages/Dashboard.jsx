// src/pages/Dashboard.jsx (or wherever your Dashboard lives)

import React, { useState, useEffect } from "react";
import { toValidDate } from "@/utils/date";

import Project, { Sprint, Story } from "@/api/entities";
import { updateAllProjectStatuses } from "@/components/utils/projectStatusUpdater";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import {
  TrendingUp,
  Target,
  CheckCircle,
  Plus,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

import MetricsCard from "../components/dashboard/MetricsCard";
import ActiveSprintCard from "../components/dashboard/ActiveSprintCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import ProjectOverview from "../components/dashboard/ProjectOverview";

// ---- helpers ---------------------------------------------------------------

const toArray = (x) => (Array.isArray(x) ? x : x?.items ? x.items : []);

// pick a reasonable timestamp field from various shapes
const pickTs = (x) =>
  toValidDate(
    x?.updated_date ?? x?.updatedAt ?? x?.updated_at ??
    x?.created_date ?? x?.createdAt ?? x?.created_at ??
    x?.updated ?? x?.created
  )?.getTime() ?? 0;

// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Ensure project meta/statuses are up to date
      await updateAllProjectStatuses();

      // ⚠️ No more string "sort" args; fetch plain lists and sort locally
      const [projectsRaw, sprintsRaw, storiesRaw] = await Promise.all([
        Project.list(),
        Sprint.list(),
        Story.list(),
      ]);

      const projectsSorted = toArray(projectsRaw).slice().sort((a, b) => pickTs(b) - pickTs(a));
      const sprintsSorted  = toArray(sprintsRaw).slice().sort((a, b) => pickTs(b) - pickTs(a));
      const storiesSorted  = toArray(storiesRaw).slice().sort((a, b) => pickTs(b) - pickTs(a)).slice(0, 20);

      setProjects(projectsSorted);
      setSprints(sprintsSorted);
      setStories(storiesSorted);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // keep UI usable even if one call failed
      setProjects((prev) => prev ?? []);
      setSprints((prev) => prev ?? []);
      setStories((prev) => prev ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const activeProjects = projects.filter((p) => p.status === "active");
  const activeSprints  = sprints.filter((s) => s.status === "active");
  const completedStories = stories.filter((s) => s.status === "done");
  const totalStoryPoints = stories.reduce((sum, s) => sum + (s.story_points || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Project Dashboard</h1>
            <p className="text-slate-700 text-lg">Monitor your agile workflow and team progress</p>
          </div>
          <Link to={createPageUrl("Projects")}>
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Active Projects"
            value={activeProjects.length}
            icon={Target}
            color="from-blue-600 to-blue-500"
            trend="+2 this month"
            isLoading={isLoading}
          />
          <MetricsCard
            title="Active Sprints"
            value={activeSprints.length}
            icon={Zap}
            color="from-purple-600 to-purple-500"
            trend="67% avg completion"
            isLoading={isLoading}
          />
          <MetricsCard
            title="Stories Completed"
            value={completedStories.length}
            icon={CheckCircle}
            color="from-emerald-600 to-emerald-500"
            trend="+15 this week"
            isLoading={isLoading}
          />
          <MetricsCard
            title="Story Points"
            value={totalStoryPoints}
            icon={TrendingUp}
            color="from-amber-600 to-amber-500"
            trend="Velocity: 42/sprint"
            isLoading={isLoading}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ActiveSprintCard
              sprints={activeSprints}
              stories={stories}
              isLoading={isLoading}
            />
          </div>
          <div>
            <RecentActivity
              stories={stories.slice(0, 8)}
              isLoading={isLoading}
            />
          </div>
        </div>

        <ProjectOverview
          projects={activeProjects}
          stories={stories}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
