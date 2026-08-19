import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Timer,
  Clock,
  Target,
  Flame,
  BarChart3,
  CalendarRange,
  CalendarDays,
  GitCommit,
  BrainCircuit,
  Settings,
  Plus,
  AlertCircle,
  Volume2,
  VolumeX,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMinutes } from '../utils/dateUtils';

export type TabType =
  | 'dashboard'
  | 'plan-tomorrow'
  | 'focus'
  | 'activity-log'
  | 'goals-projects'
  | 'habits'
  | 'analytics'
  | 'weekly-review'
  | 'monthly-review'
  | 'growth-timeline'
  | 'ai-mentor'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  onOpenQuickLog: () => void;
  onOpenInterruption: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenQuickLog,
  onOpenInterruption,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { profile, user, logout, activeTimer, todayStats, soundEnabled, setSoundEnabled } = useApp();

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plan-tomorrow', label: 'Plan Tomorrow', icon: CalendarCheck },
    { id: 'focus', label: 'Focus & Limits', icon: Timer },
    { id: 'activity-log', label: 'Activity Log', icon: Clock },
    { id: 'goals-projects', label: 'Goals & Projects', icon: Target },
    { id: 'habits', label: 'Habits & Streaks', icon: Flame },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'weekly-review', label: 'Weekly Review', icon: CalendarRange },
    { id: 'monthly-review', label: 'Monthly Review', icon: CalendarDays },
    { id: 'growth-timeline', label: 'Growth Timeline', icon: GitCommit },
    { id: 'ai-mentor', label: 'AI Mentor', icon: BrainCircuit },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const displayName = profile.name && profile.name !== 'User' ? profile.name : user ? `${user.firstName} ${user.lastName}`.trim() : 'User';
  const initial = displayName.charAt(0).toUpperCase() || 'U';

  const handleSelectTab = (id: TabType) => {
    setCurrentTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="w-60 xl:w-64 bg-zinc-900 text-zinc-200 flex flex-col h-full border-r border-zinc-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-3.5 py-3 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-xs">
            D
          </div>
          <div>
            <div className="font-semibold text-zinc-100 tracking-tight text-xs sm:text-sm leading-tight">DayTrace</div>
            <div className="text-[10px] text-zinc-400 leading-none">Adaptive Productivity</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Action Buttons (Grid layout to conserve vertical space) */}
      <div className="px-2.5 py-2 border-b border-zinc-800/60 grid grid-cols-2 gap-1.5 shrink-0">
        <button
          id="sidebar-quick-log-btn"
          onClick={() => {
            onOpenQuickLog();
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-medium transition shadow-xs cursor-pointer min-h-[30px]"
        >
          <Plus className="w-3 h-3" />
          <span>Quick Log</span>
        </button>
        <button
          id="sidebar-interruption-btn"
          onClick={() => {
            onOpenInterruption();
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 rounded-lg text-[11px] font-medium transition border border-zinc-700/50 cursor-pointer min-h-[30px]"
        >
          <AlertCircle className="w-3 h-3 text-amber-400" />
          <span>Interrupt</span>
        </button>
      </div>

      {/* Active Focus Pill if Timer running */}
      {activeTimer && (
        <div
          onClick={() => handleSelectTab('focus')}
          className="mx-2.5 my-1.5 p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-lg cursor-pointer hover:bg-emerald-950/60 transition flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="truncate">
              <div className="text-[9px] uppercase font-semibold text-emerald-400 tracking-wider leading-none">Active Focus</div>
              <div className="text-[11px] text-zinc-200 font-medium truncate mt-0.5">{activeTimer.taskName || activeTimer.activityName}</div>
            </div>
          </div>
          <Timer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </div>
      )}

      {/* Navigation Links - Fits cleanly without desktop scrollbar */}
      <nav className="flex-1 overflow-y-auto min-h-0 px-2 py-1.5 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer min-h-[32px] ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs border-l-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Today Mini Status */}
      <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-950/40 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
          <span>Today&apos;s Focus:</span>
          <span className="text-emerald-400 font-semibold">{formatMinutes(todayStats.focusMinutes)}</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, todayStats.executionRate)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[9px] text-zinc-400 mt-1">
          <span>{todayStats.completedCount}/{todayStats.totalTasksCount} tasks done</span>
          <span>{todayStats.executionRate}% rate</span>
        </div>
      </div>

      {/* User info & Logout */}
      <div className="px-3 py-2 border-t border-zinc-800/80 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 truncate max-w-[155px]">
          <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-300 font-semibold text-[11px] shrink-0">
            {initial}
          </div>
          <div className="truncate">
            <div className="text-zinc-200 font-medium text-[11px] truncate leading-tight">{displayName}</div>
            <div className="text-[9px] text-zinc-400 truncate leading-tight">{user?.email || profile.occupation}</div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md transition cursor-pointer shrink-0 min-h-[28px] min-w-[28px] flex items-center justify-center"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= lg: 1024px) */}
      <aside className="hidden lg:flex h-screen shrink-0">
        {content}
      </aside>

      {/* Mobile/Tablet Slide-over Drawer (< lg: 1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-zinc-900 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export const MobileHeader: React.FC<{
  currentTab: TabType;
  onOpenMenu: () => void;
  onOpenQuickLog: () => void;
}> = ({ currentTab, onOpenMenu, onOpenQuickLog }) => {
  const { activeTimer } = useApp();

  const tabLabels: Record<TabType, string> = {
    dashboard: 'Dashboard',
    'plan-tomorrow': 'Plan Tomorrow',
    focus: 'Focus & Limits',
    'activity-log': 'Activity Log',
    'goals-projects': 'Goals & Projects',
    habits: 'Habits & Streaks',
    analytics: 'Analytics',
    'weekly-review': 'Weekly Review',
    'monthly-review': 'Monthly Review',
    'growth-timeline': 'Growth Timeline',
    'ai-mentor': 'AI Mentor',
    settings: 'Settings',
  };

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-3.5 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMenu}
          className="p-2 -ml-1 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center border border-zinc-800/60"
          title="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            D
          </div>
          <span className="font-semibold text-zinc-100 text-sm tracking-tight truncate max-w-[150px] sm:max-w-[220px]">
            {tabLabels[currentTab]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeTimer && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-full text-[10px] font-medium animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">Active</span>
          </span>
        )}
        <button
          onClick={onOpenQuickLog}
          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer min-h-[32px] px-2.5 shadow-xs"
          title="Quick Log Activity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[11px]">Log</span>
        </button>
      </div>
    </header>
  );
};

export const MobileNav: React.FC<{
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  onOpenQuickLog: () => void;
  onOpenMenu: () => void;
}> = ({ currentTab, setCurrentTab, onOpenQuickLog, onOpenMenu }) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'plan-tomorrow', label: 'Plan', icon: CalendarCheck },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'ai-mentor', label: 'Mentor', icon: BrainCircuit },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 z-40 px-2 py-1.5 safe-area-bottom shadow-2xl flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        const isMentor = tab.id === 'ai-mentor';

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition cursor-pointer min-h-[44px] min-w-[54px] ${
              isActive
                ? isMentor
                  ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 shadow-xs'
                  : 'text-emerald-400 bg-zinc-900/80 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isMentor ? 'text-emerald-400' : 'text-emerald-400') : 'text-zinc-400'}`} />
              {isMentor && !isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* Menu / More trigger */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition cursor-pointer min-h-[44px] min-w-[54px]"
        title="More tabs and settings"
      >
        <Menu className="w-4 h-4 shrink-0 text-zinc-400" />
        <span className="text-[10px] tracking-tight leading-tight">More</span>
      </button>
    </nav>
  );
};
