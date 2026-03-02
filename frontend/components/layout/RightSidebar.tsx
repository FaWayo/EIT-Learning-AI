'use client';

import { useApp } from '@/context/AppContext';
import { UploadButton } from '@/components/resources/UploadButton';
import { ResourceList } from '@/components/resources/ResourceList';

export function RightSidebar() {
  const { handleUploadResource } = useApp();

  return (
    <aside
      className="w-72 h-full flex flex-col shrink-0 rounded-2xl overflow-hidden"
      style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
            Knowledge Base
          </p>
        </div>
        <UploadButton onFileSelect={handleUploadResource} />
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #1a1a1a' }} />

      {/* Resource list */}
      <ResourceList />
    </aside>
  );
}
