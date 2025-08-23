import React, { useState, useEffect } from "react";
import { Issue, Project, Epic, Story, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import IssueFormModal from "../components/issues/IssueFormModal";
import IssueTable from "../components/issues/IssueTable";
import IssueFilters from "../components/issues/IssueFilters";
import { Card, CardContent } from "@/components/ui/card";

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ project_id: '', status: '', priority: '', issue_type: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [issuesData, projectsData, usersData] = await Promise.all([
        Issue.list("-created_date"),
        Project.list(),
        User.list()
      ]);
      setIssues(issuesData);
      setProjects(projectsData);
      setUsers(usersData.length > 0 ? usersData : [{ email: 'demo@user.com', full_name: 'Demo User' }]);
      if (projectsData.length > 0 && !filters.project_id) {
        setFilters(f => ({ ...f, project_id: projectsData[0].id }));
      }
    } catch (error) {
      console.error("Error loading issues data:", error);
    }
    setIsLoading(false);
  };

  const handleIssueSubmit = async (issueData) => {
    try {
      if (editingIssue) {
        await Issue.update(editingIssue.id, issueData);
      } else {
        await Issue.create({ ...issueData, project_id: issueData.project_id || filters.project_id });
      }
      setShowModal(false);
      setEditingIssue(null);
      loadData();
    } catch (error) {
      console.error("Error saving issue:", error);
    }
  };

  const handleEditIssue = (issue) => {
    setEditingIssue(issue);
    setShowModal(true);
  };

  const filteredIssues = issues.filter(issue => {
    return (
      (!filters.project_id || issue.project_id === filters.project_id) &&
      (!filters.status || issue.status === filters.status) &&
      (!filters.priority || issue.priority === filters.priority) &&
      (!filters.issue_type || issue.issue_type === filters.issue_type) &&
      (!filters.search || issue.title.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Issues</h1>
            <p className="text-slate-700 text-lg">Track bugs, tasks, and improvements.</p>
          </div>
          <Button
            onClick={() => { setEditingIssue(null); setShowModal(true); }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Report Issue
          </Button>
        </motion.div>

        <Card className="shadow-lg border-0 mb-8">
          <CardContent className="p-4">
            <IssueFilters
              filters={filters}
              onFilterChange={setFilters}
              projects={projects}
            />
          </CardContent>
        </Card>

        <IssueTable
          issues={filteredIssues}
          onEdit={handleEditIssue}
          isLoading={isLoading}
          users={users}
        />

        <AnimatePresence>
          {showModal && (
            <IssueFormModal
              issue={editingIssue}
              onSubmit={handleIssueSubmit}
              onClose={() => { setShowModal(false); setEditingIssue(null); }}
              projects={projects}
              users={users}
              initialProjectId={filters.project_id}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}