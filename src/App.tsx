import React, { useEffect } from 'react';
import { useAppStore } from './services/store';
import { Gateway } from './components/gateway/Gateway';
import { CommunityPortal } from './components/community/CommunityPortal';
import { OfficialsPortal } from './components/officials/OfficialsPortal';
import { AnalystConsole } from './components/analyst/AnalystConsole';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

export default function App() {
  const { currentRole, textSize, initSessionNavigation } = useAppStore();

  // In-session navigation listener & deep linking hydration without URL path routing
  useEffect(() => {
    const cleanup = initSessionNavigation();
    return cleanup;
  }, [initSessionNavigation]);

  // Depth is role: apply theme class to wrapper
  const depthClass =
    currentRole === 'analyst'
      ? 'depth-abyss bg-[#05141F]'
      : currentRole === 'official'
      ? 'depth-shelf bg-[#0B2230]'
      : 'depth-shallows bg-[#F2F7F6]';

  const textSizeClass = textSize === 'large' ? 'text-[17px]' : 'text-[15px]';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${depthClass} ${textSizeClass}`}>
      {/* Portal Header */}
      <Header />

      {/* Main Dynamic View Governed by Strict RBAC */}
      <div className="flex-1 flex flex-col">
        {!currentRole && <Gateway />}
        {currentRole === 'user' && <CommunityPortal />}
        {currentRole === 'official' && <OfficialsPortal />}
        {currentRole === 'analyst' && <AnalystConsole />}
      </div>

      {/* Global Search Dialog (Cmd/Ctrl + K) */}
      <GlobalSearchModal />

      {/* Persistent Footer with Synthetic Demo Data Badge */}
      <Footer />
    </div>
  );
}

