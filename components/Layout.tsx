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
  
  // Logic to determine if we should render the header wrapper at all.
  // If headerContent is explicitly null (not undefined), we hide the header completely.
  const shouldRenderHeader = headerContent !== null;

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 font-sans">
      
      {/* Top Header */}
      {shouldRenderHeader && (
          <header className="z-30 absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
             <div className="w-full pointer-events-auto">
                {headerContent || (
                    <div className="flex justify-between items-center w-full">
                         <h1 className="text-xl font-black tracking-tight italic text-white drop-shadow-md">
                            CraveRate
                        </h1>
                    </div>
                )}
             </div>
          </header>
      )}

      {/* Main Content Area */}
      <main 
        className={`flex-1 w-full relative pb-24 ${isImmersive ? 'overflow-hidden bg-black' : 'overflow-y-auto no-scrollbar'}`}
      >
        {children}
      </main>

      {/* Modern Floating Navigation Dock */}
      <nav className="absolute bottom-6 left-5 right-5 z-40">
        <div 
          className={`
            w-full h-[72px] rounded-3xl flex items-center justify-around px-2 shadow-2xl backdrop-blur-2xl border transition-all duration-500 ease-out
            ${isImmersive 
              ? 'bg-black/70 border-white/10 text-white/40 shadow-black/50' 
              : 'bg-white/80 border-white/60 text-gray-400 shadow-orange-500/10'
            }
          `}
        >
          {/* Home */}
          <button 
            onClick={() => onTabChange('home')}
            className={`p-3 rounded-2xl transition-all duration-300 relative group 
              ${activeTab === 'home' 
                ? (isImmersive ? 'text-white bg-white/10' : 'text-orange-600 bg-orange-50') 
                : 'hover:scale-110 active:scale-95'
              }`}
          >
            <Home 
              className={`w-6 h-6 transition-all duration-300 ${activeTab === 'home' ? 'fill-current scale-110' : ''}`} 
              strokeWidth={activeTab === 'home' ? 2.5 : 2} 
            />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full animate-pulse" />
            )}
          </button>

          {/* CREATE BUTTON - Elevated Floating Action */}
          <div className="relative -top-6 group">
            <button 
                onClick={onCreateClick}
                className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-red-500 text-white rounded-full shadow-lg shadow-orange-500/40 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-active:scale-90"
            >
                <Plus className="w-8 h-8" />
            </button>
            {/* Glow effect behind button */}
            <div className="absolute inset-0 rounded-full bg-orange-500 blur-lg opacity-40 group-hover:opacity-60 -z-10 transition-opacity" />
          </div>

          {/* Map */}
          <button 
            onClick={() => onTabChange('map')}
            className={`p-3 rounded-2xl transition-all duration-300 relative group
              ${activeTab === 'map' 
                ? 'text-orange-600 bg-orange-50' 
                : (isImmersive ? 'hover:text-white' : 'hover:text-gray-600') + ' hover:scale-110 active:scale-95'
              }`}
          >
            <MapIcon 
              className={`w-6 h-6 transition-all duration-300 ${activeTab === 'map' ? 'fill-current scale-110' : ''}`} 
            />
            {activeTab === 'map' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
            )}
          </button>

          {/* Profile */}
          <button 
            onClick={() => onTabChange('profile')}
            className={`p-3 rounded-2xl transition-all duration-300 relative group
              ${activeTab === 'profile' 
                ? 'text-orange-600 bg-orange-50' 
                : (isImmersive ? 'hover:text-white' : 'hover:text-gray-600') + ' hover:scale-110 active:scale-95'
              }`}
          >
            <User 
              className={`w-6 h-6 transition-all duration-300 ${activeTab === 'profile' ? 'fill-current scale-110' : ''}`} 
            />
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
            )}
          </button>

        </div>
      </nav>
    </div>
  );
};