import React, { useState } from 'react';
import {
  Target,
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Goal, Project, ActivityCategory } from '../../types';
import { formatMinutes, formatReadableDate } from '../../utils/dateUtils';

export const GoalsProjectsView: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    projects,
    addProject,
    updateProject,
    deleteProject,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'goals' | 'projects'>('goals');

  // Goal Form Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState<ActivityCategory>('PRODUCTIVE');
  const [goalTargetHours, setGoalTargetHours] = useState(50);
  const [goalPriority, setGoalPriority] = useState<'high' | 'medium' | 'low'>('high');

  // Project Form Modal State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projGoalId, setProjGoalId] = useState('');
  const [projDeadline, setProjDeadline] = useState('2026-09-30');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;

    addGoal({
      name: goalName.trim(),
      description: goalDesc.trim(),
      category: goalCategory,
      targetHours: goalTargetHours,
      priority: goalPriority,
      status: 'in_progress',
    });

    setGoalName('');
    setGoalDesc('');
    setShowGoalModal(false);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    addProject({
      name: projName.trim(),
      description: projDesc.trim(),
      goalId: projGoalId || undefined,
      deadline: projDeadline || undefined,
      tasks: [],
      status: 'active',
    });

    setProjName('');
    setProjDesc('');
    setShowProjectModal(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
              Goals & High-Leverage Projects
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Tie your daily minutes directly to long-term compounding milestones.
          </p>
        </div>

        {/* Tab Switcher & Add Button */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Goals ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-zinc-800 text-blue-400 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Projects ({projects.length})
            </button>
          </div>

          <button
            onClick={() => (activeTab === 'goals' ? setShowGoalModal(true) : setShowProjectModal(true))}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add {activeTab === 'goals' ? 'Goal' : 'Project'}</span>
          </button>
        </div>
      </div>

      {/* Content for Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const currentHours = Number((goal.currentHours || 0).toFixed(1));
              const progressPct = Math.min(100, Math.round((currentHours / goal.targetHours) * 100));

              return (
                <div
                  key={goal.id}
                  className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3.5 text-xs shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-100">{goal.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            goal.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs mt-1">{goal.description}</p>
                    </div>

                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Gauge */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1 font-mono">
                      <span>Invested: {currentHours}h</span>
                      <span>Target: {goal.targetHours}h ({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px]">
                    <span className="text-zinc-400 capitalize">Priority: {goal.priority}</span>
                    <button
                      onClick={() =>
                        updateGoal(goal.id, {
                          status: goal.status === 'completed' ? 'in_progress' : 'completed',
                        })
                      }
                      className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{goal.status === 'completed' ? 'Mark Active' : 'Mark Completed'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content for Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => {
              const totalMins = proj.timeSpentMinutes || 0;
              const parentGoal = goals.find((g) => g.id === proj.goalId);

              return (
                <div
                  key={proj.id}
                  className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3.5 text-xs shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-100">{proj.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-blue-950/60 text-blue-300 border border-blue-500/30">
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs mt-1">{proj.description}</p>
                    </div>

                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono text-zinc-200">{formatMinutes(totalMins)}</span>
                    </div>
                    {proj.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Deadline: {formatReadableDate(proj.deadline)}</span>
                      </div>
                    )}
                    {parentGoal && (
                      <div className="text-emerald-400 truncate">
                        🎯 {parentGoal.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px]">
                    <span className="text-zinc-400">
                      Created: {formatReadableDate(proj.createdAt.split('T')[0])}
                    </span>
                    <button
                      onClick={() =>
                        updateProject(proj.id, {
                          status: proj.status === 'completed' ? 'active' : 'completed',
                        })
                      }
                      className="text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{proj.status === 'completed' ? 'Reactivate' : 'Complete Project'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in fade-in duration-200 text-xs">
            <h3 className="font-semibold text-zinc-100 text-sm">Add High-Leverage Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-3">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Distributed Systems & CS..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Description / Target Outcome</label>
                <input
                  type="text"
                  placeholder="e.g. Build 3 deep architectural prototypes..."
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Target Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={goalTargetHours}
                    onChange={(e) => setGoalTargetHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Priority</label>
                  <select
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in fade-in duration-200 text-xs">
            <h3 className="font-semibold text-zinc-100 text-sm">Add Project</h3>
            <form onSubmit={handleAddProject} className="space-y-3">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DayTrace MVP Launch..."
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Production ready personal growth app..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Parent Goal</label>
                  <select
                    value={projGoalId}
                    onChange={(e) => setProjGoalId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None / Standalone</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
