import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityCategory } from '../../types';
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
  const [goalCategory] = useState<ActivityCategory>('PRODUCTIVE');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Goals & High-Leverage Projects
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Tie your daily minutes directly to long-term compounding milestones.
          </p>
        </div>

        {/* Tab Switcher & Add Button */}
        <div className="flex items-center gap-2.5">
          <div className="clay-card-sm p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'goals'
                  ? 'clay-nav-active text-emerald-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Goals ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'clay-nav-active text-blue-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Projects ({projects.length})
            </button>
          </div>

          <button
            onClick={() => (activeTab === 'goals' ? setShowGoalModal(true) : setShowProjectModal(true))}
            className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
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
                  className="p-5 sm:p-6 clay-card-interactive space-y-4 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{goal.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              goal.status === 'completed'
                                ? 'clay-pill-emerald'
                                : 'clay-pill text-zinc-300'
                            }`}
                          >
                            {goal.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-1 font-medium">{goal.description}</p>
                      </div>

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="clay-btn-secondary p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Gauge */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono font-medium">
                        <span>Invested: {currentHours}h</span>
                        <span>Target: {goal.targetHours}h ({progressPct}%)</span>
                      </div>
                      <div className="w-full clay-inset h-2 rounded-full overflow-hidden p-0.5">
                        <div
                          className="bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px]">
                    <span className="text-zinc-400 capitalize font-medium">Priority: {goal.priority}</span>
                    <button
                      onClick={() =>
                        updateGoal(goal.id, {
                          status: goal.status === 'completed' ? 'in_progress' : 'completed',
                        })
                      }
                      className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1.5 transition"
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
                  className="p-5 sm:p-6 clay-card-interactive space-y-4 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{proj.name}</span>
                          <span className="clay-pill-blue text-[10px] px-2 py-0.5 font-bold">
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-1 font-medium">{proj.description}</p>
                      </div>

                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="clay-btn-secondary p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-zinc-400 text-[11px] mt-3 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-mono text-white font-bold">{formatMinutes(totalMins)}</span>
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
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px]">
                    <span className="text-zinc-400 font-medium">
                      Created: {formatReadableDate(proj.createdAt.split('T')[0])}
                    </span>
                    <button
                      onClick={() =>
                        updateProject(proj.id, {
                          status: proj.status === 'completed' ? 'active' : 'completed',
                        })
                      }
                      className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1.5 transition"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="clay-modal w-full max-w-md p-6 space-y-4 animate-in fade-in duration-200 text-xs">
            <h3 className="font-extrabold text-white text-sm">Add High-Leverage Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-3.5">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Distributed Systems & CS..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description / Target Outcome</label>
                <input
                  type="text"
                  placeholder="e.g. Build 3 deep architectural prototypes..."
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none min-h-[38px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Target Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={goalTargetHours}
                    onChange={(e) => setGoalTargetHours(Number(e.target.value))}
                    className="clay-input w-full px-3.5 py-2.5 text-white text-xs focus:outline-none min-h-[38px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Priority</label>
                  <select
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value as any)}
                    className="clay-input w-full px-3.5 py-2.5 text-zinc-200 text-xs focus:outline-none min-h-[38px] cursor-pointer"
                  >
                    <option value="high" className="bg-[#141822] text-zinc-200">High</option>
                    <option value="medium" className="bg-[#141822] text-zinc-200">Medium</option>
                    <option value="low" className="bg-[#141822] text-zinc-200">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="clay-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-5 py-2 font-bold text-xs"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="clay-modal w-full max-w-md p-6 space-y-4 animate-in fade-in duration-200 text-xs">
            <h3 className="font-extrabold text-white text-sm">Add Project</h3>
            <form onSubmit={handleAddProject} className="space-y-3.5">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DayTrace MVP Launch..."
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Production ready personal growth app..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="clay-input w-full px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none min-h-[38px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Parent Goal</label>
                  <select
                    value={projGoalId}
                    onChange={(e) => setProjGoalId(e.target.value)}
                    className="clay-input w-full px-3.5 py-2.5 text-zinc-200 text-xs focus:outline-none min-h-[38px] cursor-pointer"
                  >
                    <option value="" className="bg-[#141822] text-zinc-300">None / Standalone</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id} className="bg-[#141822] text-zinc-200">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="clay-input w-full px-3.5 py-2.5 text-white text-xs focus:outline-none min-h-[38px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="clay-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary px-5 py-2 font-bold text-xs"
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
