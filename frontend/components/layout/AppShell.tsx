'use client';

import { useApp } from '@/context/AppContext';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { PanelLeftIcon, PanelRightIcon, GraduationCapIcon } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { state, dispatch } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-base p-2 gap-2">
      {/* Left sidebar */}
      <div
        className={`transition-all duration-300 overflow-hidden shrink-0 ${
          state.leftSidebarOpen ? 'w-64' : 'w-0'
        } lg:relative absolute inset-y-0 left-0 z-20`}
      >
        <LeftSidebar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 rounded-2xl relative" style={{ background: '#0e0e0e', border: '1px solid #1a1a1a' }}>
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center justify-between px-3 py-2.5 shrink-0 rounded-t-2xl"
          style={{ borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}
        >
          <button
            onClick={() => dispatch({ type: 'TOGGLE_LEFT_SIDEBAR' })}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary transition-colors"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#131313')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            title="Toggle chat history"
          >
            <PanelLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)' }}
            >
              <GraduationCapIcon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="font-semibold text-sm">
              <span className="gradient-text">MEST</span>
              <span className="text-text-secondary"> AI</span>
            </span>
          </div>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' })}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary transition-colors"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#131313')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            title="Toggle knowledge base"
          >
            <PanelRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop sidebar toggle buttons */}
        <div className="hidden lg:flex absolute z-10 top-3 left-3 gap-1">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_LEFT_SIDEBAR' })}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-all duration-150"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#1a1a1a')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            title={state.leftSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <PanelLeftIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden lg:block absolute z-10 top-3 right-3">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' })}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-all duration-150"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#1a1a1a')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            title={state.rightSidebarOpen ? 'Close panel' : 'Open panel'}
          >
            <PanelRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Right sidebar */}
      <div
        className={`transition-all duration-300 overflow-hidden shrink-0 ${
          state.rightSidebarOpen ? 'w-72' : 'w-0'
        } lg:relative absolute inset-y-0 right-0 z-20`}
      >
        <RightSidebar />
      </div>

      {/* Mobile backdrop */}
      {(state.leftSidebarOpen || state.rightSidebarOpen) && (
        <div
          className="lg:hidden fixed inset-0 z-10"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => {
            if (state.leftSidebarOpen) dispatch({ type: 'TOGGLE_LEFT_SIDEBAR' });
            if (state.rightSidebarOpen) dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' });
          }}
        />
      )}
    </div>
  );
}
