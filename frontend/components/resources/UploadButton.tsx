'use client';

import { useRef, useState } from 'react';
import { UploadIcon, XIcon, CheckIcon } from 'lucide-react';
import { ResourceScope } from '@/types';

interface UploadButtonProps {
  onFileSelect: (file: File, scope: ResourceScope) => void;
  disabled?: boolean;
}

export function UploadButton({ onFileSelect, disabled = false }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [scope, setScope] = useState<ResourceScope>('global');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    e.target.value = '';
  }

  function handleConfirm() {
    if (!pendingFile) return;
    onFileSelect(pendingFile, scope);
    setPendingFile(null);
    setScope('global');
  }

  function handleCancel() {
    setPendingFile(null);
    setScope('global');
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || !!pendingFile}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-white font-medium text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)',
          boxShadow: '0 0 12px rgba(37,173,145,0.18)',
        }}
        onMouseEnter={(e) => {
          if (!disabled && !pendingFile)
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 18px rgba(37,173,145,0.30)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(37,173,145,0.18)';
        }}
      >
        <UploadIcon className="w-5 h-5" strokeWidth={2.5} />
        Upload File
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md"
        className="hidden"
        onChange={handleFileChange}
      />

      {pendingFile && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: '#131313', border: '1px solid #1f1f1f' }}
        >
          <p
            className="text-sm truncate font-medium"
            style={{ color: '#c0c0c0' }}
            title={pendingFile.name}
          >
            {pendingFile.name}
          </p>

          {/* Scope toggle */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid #1f1f1f', background: '#0e0e0e' }}
          >
            {(['chat', 'global'] as ResourceScope[]).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className="flex-1 text-sm py-2 transition-all duration-150 font-medium"
                style={{
                  background: scope === s ? 'rgba(37,173,145,0.10)' : 'transparent',
                  color: scope === s ? '#25ad91' : '#555',
                  borderRight: s === 'chat' ? '1px solid #1f1f1f' : 'none',
                }}
              >
                {s === 'chat' ? 'This chat' : 'All chats'}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #25ad91 0%, #1e9a80 100%)' }}
            >
              <CheckIcon className="w-4 h-4" strokeWidth={2.5} />
              Upload
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm transition-all"
              style={{ background: '#1a1a1a', color: '#555' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = '#a0a0a0')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = '#555')
              }
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
