'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // New project form state
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [projectsData, issuesData] = await Promise.all([
        api.getProjects(),
        api.getIssues(),
      ]);
      setProjects(projectsData);
      setIssues(issuesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setFormError('');

    if (!newProject.name.trim()) {
      setFormError('Project name is required');
      return;
    }

    setFormLoading(true);
    try {
      const created = await api.createProject(newProject);
      setProjects([created, ...projects]);
      setNewProject({ name: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  // Compute stats from data
  const totalIssues = issues.length;
  const openIssues = issues.filter(i => i.status !== 'DONE').length;
  const completedIssues = issues.filter(i => i.status === 'DONE').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Issue Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Projects" value={projects.length} color="blue" />
          <StatCard label="Total Issues" value={totalIssues} color="gray" />
          <StatCard label="Open Issues" value={openIssues} color="yellow" />
          <StatCard label="Completed" value={completedIssues} color="green" />
        </div>

        {/* Projects */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {/* New Project Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <form onSubmit={handleCreateProject} className="space-y-3">
              {formError && (
                <p className="text-red-600 text-sm">{formError}</p>
              )}
              <input
                type="text"
                placeholder="Project name *"
                value={newProject.name}
                onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newProject.description}
                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        )}

        {/* Project List */}
        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
  };

  return (
    <div className={`rounded-lg p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 font-medium">{label}</p>
    </div>
  );
}
