'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const STATUS_LABELS = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
};

export default function ProjectPage() {
  const router = useRouter();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({ status: '', priority: '', title: '' });

  // Issue form
  const [showForm, setShowForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const [projectData, issuesData] = await Promise.all([
        api.getProject(id),
        api.getIssues({ projectId: id }),
      ]);
      setProject(projectData);
      setIssues(issuesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateIssue(e) {
    e.preventDefault();
    setFormError('');

    if (!newIssue.title.trim()) {
      setFormError('Issue title is required');
      return;
    }

    setFormLoading(true);
    try {
      const created = await api.createIssue({ ...newIssue, projectId: parseInt(id) });
      setIssues([created, ...issues]);
      setNewIssue({ title: '', description: '', priority: 'MEDIUM' });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleStatusChange(issueId, status) {
    try {
      const updated = await api.updateIssue(issueId, { status });
      setIssues(issues.map(i => i.id === issueId ? updated : i));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteIssue(issueId) {
    if (!confirm('Delete this issue?')) return;
    try {
      await api.deleteIssue(issueId);
      setIssues(issues.filter(i => i.id !== issueId));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleArchiveProject() {
    if (!confirm('Archive this project?')) return;
    try {
      await api.updateProject(id, { isArchived: true });
      router.push('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  }

  // Apply filters client-side
  const filteredIssues = issues.filter(issue => {
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.priority && issue.priority !== filters.priority) return false;
    if (filters.title && !issue.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-800">{project?.name}</h1>
        </div>
        <button
          onClick={handleArchiveProject}
          className="text-sm text-red-500 hover:underline"
        >
          Archive Project
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Project Info */}
        {project?.description && (
          <p className="text-gray-500 text-sm mb-6">{project.description}</p>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by title..."
            value={filters.title}
            onChange={e => setFilters({ ...filters, title: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-40"
          />
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={e => setFilters({ ...filters, priority: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {(filters.status || filters.priority || filters.title) && (
            <button
              onClick={() => setFilters({ status: '', priority: '', title: '' })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Issues Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Issues
            <span className="ml-2 text-sm font-normal text-gray-400">
              {filteredIssues.length} of {issues.length}
            </span>
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Issue'}
          </button>
        </div>

        {/* New Issue Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <form onSubmit={handleCreateIssue} className="space-y-3">
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              <input
                type="text"
                placeholder="Issue title *"
                value={newIssue.title}
                onChange={e => setNewIssue({ ...newIssue, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newIssue.description}
                onChange={e => setNewIssue({ ...newIssue, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newIssue.priority}
                onChange={e => setNewIssue({ ...newIssue, priority: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Creating...' : 'Create Issue'}
              </button>
            </form>
          </div>
        )}

        {/* Issue List */}
        {filteredIssues.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">
              {issues.length === 0 ? 'No issues yet. Create your first one!' : 'No issues match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[issue.priority]}`}>
                      {issue.priority}
                    </span>
                    <h3 className="font-medium text-gray-800 text-sm">{issue.title}</h3>
                  </div>
                  {issue.description && (
                    <p className="text-xs text-gray-500 mt-1">{issue.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={issue.status}
                    onChange={e => handleStatusChange(issue.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDeleteIssue(issue.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
