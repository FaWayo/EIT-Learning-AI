'use client';

import { Trash2Icon, FileTextIcon, FileIcon, Hash } from 'lucide-react';
import { Resource, ProcessingStatus } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const TYPE_CONFIG: Record<
  Resource['type'],
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  pdf: { label: 'PDF', icon: FileIcon, color: '#f87171', bg: 'rgba(248,113,113,0.10)' },
  txt: { label: 'TXT', icon: FileTextIcon, color: '#a0a0a0', bg: 'rgba(160,160,160,0.08)' },
  md: { label: 'MD', icon: Hash, color: '#25ad91', bg: 'rgba(37,173,145,0.10)' },
};

const STATUS_CONFIG: Record<
  ProcessingStatus,
  { label: string; color: string; bg: string; pulse?: boolean }
> = {
  queued: { label: 'Queued', color: '#888', bg: 'rgba(136,136,136,0.10)' },
  processing: { label: 'Processing...', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', pulse: true },
  processed: { label: 'Ready', color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
  failed: { label: 'Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
};

interface ResourceItemProps {
  resource: Resource;
  onDelete: (id: string) => void;
}

export function ResourceItem({ resource, onDelete }: ResourceItemProps) {
  const cfg = TYPE_CONFIG[resource.type];
  const Icon = cfg.icon;
  const statusCfg = STATUS_CONFIG[resource.status];

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 rounded-xl cursor-default transition-all duration-150"
      style={{ background: 'transparent' }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background = '#131313')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = 'transparent')
      }
    >
      {/* File type icon */}
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: cfg.bg }}
      >
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </span>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate leading-tight"
          style={{ color: '#ffffff' }}
          title={resource.name}
        >
          {resource.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {cfg.label}
          </span>
          <span className="text-[11px] text-white/40">
            {formatBytes(resource.size)}
          </span>
          <span
            className={`text-[11px] font-medium px-1.5 py-0.5 rounded${statusCfg.pulse ? ' animate-pulse' : ''}`}
            style={{ color: statusCfg.color, background: statusCfg.bg }}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(resource.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all shrink-0"
        style={{ color: '#555' }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color = '#ef4444')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color = '#555')
        }
        title="Remove resource"
      >
        <Trash2Icon className="w-4 h-4" />
      </button>
    </div>
  );
}
