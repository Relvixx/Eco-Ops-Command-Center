// ============================================
// App.tsx — Main Layout Assembly
// Source: UX §10
// 30/70 desktop split, single column mobile
// ============================================

import { useGameContext } from './context/GameContext';
import CommandHeader from './components/CommandHeader';
import BaseHealthDisplay from './components/BaseHealthDisplay';
import ActivityIntelForm from './components/ActivityIntelForm';
import AIAdvisorPanel from './components/AIAdvisorPanel';
import MissionLog from './components/MissionLog';
import { getHPState } from './utils/hpCalculator';
import { HP_STATE_CONFIG } from './constants/hpStates';

function AppContent() {
  const { state } = useGameContext();
  
  // Apply HP-aware background overlay to the main wrapper
  const hpState = getHPState(state.baseHealth);
  const overlayClass = HP_STATE_CONFIG[hpState].bgOverlayClass;

  return (
    <div className={`min-h-screen relative transition-colors duration-1000 ${overlayClass}`}>
      {/* Tier 3 Drama: BASE DESTROYED Screen Flicker Overlay */}
      {hpState === 'DESTROYED' && (
        <div className="fixed inset-0 pointer-events-none z-40 bg-red-950/20 mix-blend-color-burn animate-[screenFlicker_3s_infinite]" />
      )}

      <CommandHeader />

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column (30% on desktop) — Visual Core */}
          <div className="lg:col-span-4 lg:sticky lg:top-[88px] flex flex-col gap-6">
            <BaseHealthDisplay />
            <AIAdvisorPanel />
          </div>

          {/* Right Column (70% on desktop) — Interaction & Data */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <ActivityIntelForm />
            <MissionLog />
          </div>

        </div>
      </main>
    </div>
  );
}

export default AppContent;
