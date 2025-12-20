
import React from 'react';
import { Home, Map as MapIcon, User, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'map' | 'profile';
  onTabChange: (tab: 'home' | 'map' | 'profile') => void;
  onCreateClick?: () => void;
  isImmersive?: boolean;
  headerContent?: React.ReactNode; 
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onCreateClick, isImmersive = false, headerContent }) => {
  const shouldRenderHeader = headerContent !== null;

  return (
    <div className="h-[100dvh] bg-gray-100 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 font-sans">
      
      {/* Top Header - Refined for depth */}
      {shouldRenderHeader && (
          <header className="z-50 absolute top-0 left-0 right-0 h-24 flex items-start justify-between px-4 pointer-events-none pt-2">
             <div className="w-full pointer-events-auto">
                {headerContent || (
                    <div className="flex justify-between items-center w-full px-5 pt-5">
                         <h1 className="text-xl font-black tracking-tighter text-white drop-shadow-lg">
                            Crave<span className="text-orange-500">Rate</span>
                        </h1>
                    </div>
                )}
             </div>
          </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full relative h-full transition-colors duration-700 ${isImmersive ? 'bg-black' : 'bg-white'}`}>
        {children}
      </main>

      {/* HYPER-MODERN FLOATING DOCK */}
      <nav className="absolute bottom-6 left-6 right-6 z-50 pointer-events-none">
        <div 
          className={`
            w-full h-14 rounded-full flex items-center justify-between px-2 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-3xl border pointer-events-auto transition-all duration-500
            ${isImmersive ? 'bg-white/10 border-white/10 text-white' : 'bg-white/80 border-black/[0.03] text-gray-400'}
          `}
        >
          {/* Home Tab */}
          <button 
            onClick={() => onTabChange('home')}
            className="relative flex-1 flex flex-col items-center justify-center h-full transition-all active:scale-90 group"
          >
            <div className={`
              absolute inset-y-1.5 inset-x-1 rounded-full transition-all duration-300
              ${activeTab === 'home' ? (isImmersive ? 'bg-white/10' : 'bg-orange-50') : 'bg-transparent'}
            `} />
            <Home 
              className={`w-5.5 h-5.5 z-10 transition-all duration-300 ${activeTab === 'home' ? 'text-orange-500 scale-110' : 'opacity-60 group-hover:opacity-100'}`} 
              strokeWidth={activeTab === 'home' ? 2.5 : 2}
              fill={activeTab === 'home' ? 'currentColor' : 'none'}
            />
          </button>

          {/* Map Tab */}
          <button 
            onClick={() => onTabChange('map')}
            className="relative flex-1 flex flex-col items-center justify-center h-full transition-all active:scale-90 group"
          >
            <div className={`
              absolute inset-y-1.5 inset-x-1 rounded-full transition-all duration-300
              ${activeTab === 'map' ? (isImmersive ? 'bg-white/10' : 'bg-orange-50') : 'bg-transparent'}
            `} />
            <MapIcon 
              className={`w-5.5 h-5.5 z-10 transition-all duration-300 ${activeTab === 'map' ? 'text-orange-500 scale-110' : 'opacity-60 group-hover:opacity-100'}`} 
              strokeWidth={activeTab === 'map' ? 2.5 : 2}
              fill={activeTab === 'map' ? 'currentColor' : 'none'}
            />
          </button>

          {/* REFINED CENTRAL ACTION BUTTON */}
          <div className="relative flex-1 flex items-center justify-center h-full">
            <div className="absolute -top-1 w-14 h-14 bg-white/10 rounded-full blur-xl animate-pulse pointer-events-none" />
            <button 
                onClick={onCreateClick}
                className="w-12 h-12 bg-gradient-to-tr from-orange-400 to-orange-600 text-white rounded-full shadow-[0_8px_20px_rgba(249,115,22,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 group border-2 border-white/20 z-10"
            >
                <Plus className="w-7 h-7 group-hover:rotate-90 transition-all duration-500" strokeWidth={3} />
            </button>
          </div>

          {/* Profile Tab */}
          <button 
            onClick={() => onTabChange('profile')}
            className="relative flex-1 flex flex-col items-center justify-center h-full transition-all active:scale-90 group"
          >
            <div className={`
              absolute inset-y-1.5 inset-x-1 rounded-full transition-all duration-300
              ${activeTab === 'profile' ? (isImmersive ? 'bg-white/10' : 'bg-orange-50') : 'bg-transparent'}
            `} />
            <User 
              className={`w-5.5 h-5.5 z-10 transition-all duration-300 ${activeTab === 'profile' ? 'text-orange-500 scale-110' : 'opacity-60 group-hover:opacity-100'}`} 
              strokeWidth={activeTab === 'profile' ? 2.5 : 2}
              fill={activeTab === 'profile' ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </nav>
      
      {/* Bottom safe area gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-30" />
    </div>
  );
};
