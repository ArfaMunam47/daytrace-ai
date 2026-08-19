import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthView } from './components/AuthView';
import { Sidebar, MobileHeader, MobileNav, TabType } from './components/Sidebar';
import { ActiveTimerHUD } from './components/ActiveTimerHUD';
import { QuickLogModal } from './components/QuickLogModal';
import { InterruptionModal } from './components/InterruptionModal';
import { OnboardingModal } from './components/OnboardingModal';

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
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [showInterruptionModal, setShowInterruptionModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle Tab navigation
  const handleNavigateTab = (tab: TabType) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

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
        />

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
          {currentTab === 'settings' && <SettingsView />}
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
