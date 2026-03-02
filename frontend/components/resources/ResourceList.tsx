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
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-14">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: '#131313', border: '1px solid #1f1f1f' }}
        >
          <UploadIcon className="w-5 h-5 text-text-muted" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
            No files yet
          </p>
          <p className="text-xs text-white/40 leading-relaxed">
            Upload PDF, TXT, or MD files to ground the AI in your course materials
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
