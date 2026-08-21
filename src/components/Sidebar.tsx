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
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMinutes } from '../utils/dateUtils';
import { UserAccountMenu } from './UserAccountMenu';

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
  onOpenProfile?: () => void;
  onOpenPhilosophy?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenQuickLog,
  onOpenInterruption,
  onOpenProfile,
  onOpenPhilosophy,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { activeTimer, todayStats, soundEnabled, setSoundEnabled } = useApp();

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

  const handleSelectTab = (id: TabType) => {
    setCurrentTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="w-56 xl:w-60 bg-gradient-to-b from-[#151a24] to-[#0f131a] text-zinc-200 flex flex-col h-full border-r border-white/5 shrink-0 select-none shadow-[4px_0_24px_rgba(0,0,0,0.35)]">
      {/* Brand Header */}
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 border border-white/30 flex items-center justify-center text-white font-bold text-xs shadow-[0_3px_8px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]">
            D
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-xs sm:text-sm leading-tight">DayTrace</div>
            <div className="text-[9.5px] text-zinc-400 font-medium leading-none">Adaptive Productivity</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition cursor-pointer border border-transparent hover:border-white/5"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition cursor-pointer"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Action Buttons (Claymorphic tactile buttons) */}
      <div className="px-2 py-1.5 border-b border-white/5 grid grid-cols-2 gap-1.5 shrink-0">
        <button
          id="sidebar-quick-log-btn"
          onClick={() => {
            onOpenQuickLog();
            if (onCloseMobile) onCloseMobile();
          }}
          className="clay-btn-primary flex items-center justify-center gap-1 py-1.5 px-2 text-[10.5px] font-semibold min-h-[28px]"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          <span>Quick Log</span>
        </button>
        <button
          id="sidebar-interruption-btn"
          onClick={() => {
            onOpenInterruption();
            if (onCloseMobile) onCloseMobile();
          }}
          className="clay-btn-secondary flex items-center justify-center gap-1 py-1.5 px-2 text-[10.5px] font-semibold min-h-[28px]"
        >
          <AlertCircle className="w-3 h-3 text-amber-400 stroke-[2.5]" />
          <span>Interrupt</span>
        </button>
      </div>

      {/* Active Focus Pill if Timer running */}
      {activeTimer && (
        <div
          onClick={() => handleSelectTab('focus')}
          className="mx-2 my-1 p-2 bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-500/30 rounded-xl cursor-pointer hover:border-emerald-500/50 transition flex items-center justify-between shrink-0 shadow-[0_3px_10px_rgba(5,150,105,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_6px_#34d399]" />
            <div className="truncate">
              <div className="text-[8.5px] uppercase font-bold text-emerald-400 tracking-wider leading-none">Active Focus</div>
              <div className="text-[10.5px] text-zinc-100 font-medium truncate mt-0.5">{activeTimer.taskName || activeTimer.activityName}</div>
            </div>
          </div>
          <Timer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </div>
      )}

      {/* Navigation Links - Scrollbar free, perfectly proportioned */}
      <nav className="flex-1 overflow-y-auto min-h-0 px-1.5 py-1 space-y-0.5 no-scrollbar scrollbar-none sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[12px] font-medium transition cursor-pointer min-h-[30px] ${
                isActive
                  ? 'clay-nav-active font-bold'
                  : 'clay-nav-inactive'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Today Mini Status */}
      <div className="px-2.5 py-1.5 border-t border-white/5 bg-[#0e1218] shrink-0">
        <div className="flex items-center justify-between text-[9.5px] text-zinc-400 mb-1">
          <span>Today&apos;s Focus:</span>
          <span className="text-emerald-400 font-bold">{formatMinutes(todayStats.focusMinutes)}</span>
        </div>
        <div className="clay-inset w-full rounded-full h-1.5 p-0.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_1px_4px_rgba(16,185,129,0.5)]"
            style={{ width: `${Math.min(100, todayStats.executionRate)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[8.5px] text-zinc-400 mt-1 font-medium">
          <span>{todayStats.completedCount}/{todayStats.totalTasksCount} tasks</span>
          <span className="text-zinc-300 font-semibold">{todayStats.executionRate}% rate</span>
        </div>
      </div>

      {/* User Account Menu Trigger & Dropdown */}
      <div className="p-1.5 border-t border-white/5 bg-[#0c0f14] shrink-0">
        <UserAccountMenu
          onOpenProfile={onOpenProfile || (() => {})}
          onOpenSettings={() => {
            handleSelectTab('settings');
          }}
          onOpenPhilosophy={onOpenPhilosophy}
        />
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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#121620] z-10 shadow-2xl animate-in slide-in-from-left duration-200">
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
  onGoBack?: () => void;
  canGoBack?: boolean;
}> = ({ currentTab, onOpenMenu, onOpenQuickLog, onGoBack, canGoBack }) => {
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

  const showBackButton = canGoBack && currentTab !== 'dashboard' && onGoBack;

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-[#0e1219]/95 backdrop-blur-md border-b border-white/5 px-3 py-2.5 flex items-center justify-between shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <button
            onClick={onGoBack}
            className="clay-btn-secondary px-2.5 py-1.5 rounded-xl min-h-[38px] flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition cursor-pointer"
            title="Go back to previous screen"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">Back</span>
          </button>
        ) : (
          <button
            onClick={onOpenMenu}
            className="clay-btn-secondary p-2 rounded-xl min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 text-zinc-200" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 border border-white/30 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-[0_2px_8px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
            D
          </div>
          <span className="font-bold text-white text-sm tracking-tight truncate max-w-[130px] sm:max-w-[220px]">
            {tabLabels[currentTab]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showBackButton && (
          <button
            onClick={onOpenMenu}
            className="clay-btn-secondary p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {activeTimer && (
          <span className="clay-pill clay-pill-emerald flex items-center gap-1 px-2 py-1 text-[10px] font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">Active</span>
          </span>
        )}
        <button
          onClick={onOpenQuickLog}
          className="clay-btn-primary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 min-h-[36px]"
          title="Quick Log Activity"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0c1017]/95 backdrop-blur-xl border-t border-white/5 z-40 px-3 py-2 safe-area-bottom shadow-[0_-10px_25px_rgba(0,0,0,0.5)] flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        const isMentor = tab.id === 'ai-mentor';

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition cursor-pointer min-h-[44px] min-w-[54px] ${
              isActive
                ? isMentor
                  ? 'clay-pill-purple font-bold'
                  : 'clay-nav-active font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isMentor ? 'text-purple-300' : 'text-emerald-400') : 'text-zinc-400'}`} />
              {isMentor && !isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* Menu / More trigger */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl text-zinc-400 hover:text-zinc-200 transition cursor-pointer min-h-[44px] min-w-[54px]"
        title="More tabs and settings"
      >
        <Menu className="w-4 h-4 shrink-0 text-zinc-400" />
        <span className="text-[10px] tracking-tight leading-tight font-medium">More</span>
      </button>
    </nav>
  );
};
