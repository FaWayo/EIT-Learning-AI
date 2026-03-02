'use client';

import { UploadIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ResourceItem } from './ResourceItem';

export function ResourceList() {
  const { state, handleDeleteResource } = useApp();

  const visibleResources = state.resources.filter(
    (r) => r.chatId === null || r.chatId === state.activeChatId,
  );

  if (visibleResources.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-12">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: '#131313', border: '1px solid #1f1f1f' }}
        >
          <UploadIcon className="w-4 h-4 text-text-muted" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-medium" style={{ color: '#a0a0a0' }}>
            No files yet
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Upload PDF, TXT, or MD files to ground the AI in your course materials
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {visibleResources.map((resource) => (
        <ResourceItem
          key={resource.id}
          resource={resource}
          onDelete={handleDeleteResource}
        />
      ))}
    </div>
  );
}
