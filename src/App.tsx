import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, Plus } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthView } from './components/AuthView';
import { Sidebar, MobileHeader, MobileNav, TabType } from './components/Sidebar';
import { ActiveTimerHUD } from './components/ActiveTimerHUD';
import { QuickLogModal } from './components/QuickLogModal';
import { InterruptionModal } from './components/InterruptionModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileModal } from './components/ProfileModal';
import { PhilosophyModal } from './components/PhilosophyModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PlanTomorrowView } from './components/views/PlanTomorrowView';
import { FocusView } from './components/views/FocusView';
import { ActivityLogView } from './components/views/ActivityLogView';
import { GoalsProjectsView } from './components/views/GoalsProjectsView';
import { HabitsStreaksView } from './components/views/HabitsStreaksView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { WeeklyReviewView } from './components/views/WeeklyReviewView';
import { MonthlyReviewView } from './components/views/MonthlyReviewView';
import { GrowthTimelineView } from './components/views/GrowthTimelineView';
import { AIMentorView } from './components/views/AIMentorView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC = () => {
  const { authStatus } = useApp();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [tabHistory, setTabHistory] = useState<TabType[]>(['dashboard']);
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [showInterruptionModal, setShowInterruptionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle Tab navigation with history tracking
  const handleNavigateTab = (tab: TabType) => {
    if (tab !== currentTab) {
      setTabHistory((prev) => [...prev, tab]);
      setCurrentTab(tab);
    }
    setIsMobileMenuOpen(false);
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop(); // remove current tab
      const previousTab = nextHistory[nextHistory.length - 1];
      setTabHistory(nextHistory);
      setCurrentTab(previousTab);
    } else {
      setCurrentTab('dashboard');
      setTabHistory(['dashboard']);
    }
  };

  const previousTabLabel =
    tabHistory.length > 1
      ? tabHistory[tabHistory.length - 2].charAt(0).toUpperCase() +
        tabHistory[tabHistory.length - 2].slice(1).replace('-', ' ')
      : 'Dashboard';

  const canGoBack = tabHistory.length > 1 || currentTab !== 'dashboard';

  if (authStatus === 'LOADING') {
    return (
      <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            D
          </div>
          <span className="text-lg font-bold tracking-tight">DayTrace</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span>Verifying secure session...</span>
        </div>
      </div>
    );
  }

  if (authStatus === 'UNAUTHENTICATED') {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar: Desktop fixed on lg: (1024px+), Drawer overlay on mobile/tablet */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        onOpenQuickLog={() => setShowQuickLogModal(true)}
        onOpenInterruption={() => setShowInterruptionModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenPhilosophy={() => setShowPhilosophyModal(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Area (Full available width on desktop) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Mobile / Tablet Top Header (< lg) */}
        <MobileHeader
          currentTab={currentTab}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickLog={() => setShowQuickLogModal(true)}
          onGoBack={handleGoBack}
          canGoBack={canGoBack}
        />

        {/* Desktop Top Bar (>= lg) with Back Button & Direct Actions */}
        {currentTab !== 'dashboard' && (
          <header className="hidden lg:flex items-center justify-between px-6 py-2.5 bg-[#0e1219]/90 backdrop-blur-md border-b border-white/5 shrink-0 z-20">
            <div className="flex items-center gap-3">
              {canGoBack && (
                <button
                  onClick={handleGoBack}
                  className="clay-btn-secondary px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer min-h-[34px]"
                  title={`Go back to ${previousTabLabel}`}
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Back to {previousTabLabel}</span>
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <span className="text-zinc-500">DayTrace</span>
                <span>/</span>
                <span className="text-zinc-200 font-bold capitalize">{currentTab.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInterruptionModal(true)}
                className="clay-btn-secondary px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white min-h-[34px] cursor-pointer"
                title="Record Real-Life Interruption / Family / Home"
              >
                <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interrupt</span>
              </button>
              <button
                onClick={() => setShowQuickLogModal(true)}
                className="clay-btn-primary px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold min-h-[34px] cursor-pointer"
                title="Quick Activity Log"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Quick Log</span>
              </button>
            </div>
          </header>
        )}

        {/* Scrollable View Content */}
        <main
          className={`flex-1 relative ${
            currentTab === 'ai-mentor'
              ? 'overflow-hidden flex flex-col pb-16 lg:pb-0'
              : 'overflow-y-auto pb-20 lg:pb-6 scrollbar-thin'
          }`}
        >
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={handleNavigateTab}
              onOpenQuickLog={() => setShowQuickLogModal(true)}
              onOpenInterruption={() => setShowInterruptionModal(true)}
            />
          )}
          {currentTab === 'plan-tomorrow' && <PlanTomorrowView />}
          {currentTab === 'focus' && <FocusView />}
          {currentTab === 'activity-log' && (
            <ActivityLogView
              onOpenQuickLog={() => setShowQuickLogModal(true)}
              onOpenInterruption={() => setShowInterruptionModal(true)}
            />
          )}
          {currentTab === 'goals-projects' && <GoalsProjectsView />}
          {currentTab === 'habits' && <HabitsStreaksView />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'weekly-review' && <WeeklyReviewView />}
          {currentTab === 'monthly-review' && <MonthlyReviewView />}
          {currentTab === 'growth-timeline' && <GrowthTimelineView />}
          {currentTab === 'ai-mentor' && <AIMentorView />}
          {currentTab === 'settings' && (
            <SettingsView
              onGoBack={canGoBack ? handleGoBack : undefined}
              previousTabLabel={previousTabLabel}
            />
          )}
        </main>
      </div>

      {/* Floating Active Focus / Distraction Timer HUD */}
      <ActiveTimerHUD />

      {/* Global Quick Action Modals */}
      <QuickLogModal
        isOpen={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
      />
      <InterruptionModal
        isOpen={showInterruptionModal}
        onClose={() => setShowInterruptionModal(false)}
      />

      {/* User Profile & Philosophy Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <PhilosophyModal
        isOpen={showPhilosophyModal}
        onClose={() => setShowPhilosophyModal(false)}
      />

      {/* Onboarding Wizard */}
      <OnboardingModal />

      {/* Responsive Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        onOpenQuickLog={() => setShowQuickLogModal(true)}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
