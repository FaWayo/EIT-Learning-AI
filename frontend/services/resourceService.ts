import { Resource, ResourceScope } from '@/types';

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    chatId: null,
    name: 'EIT Entrepreneurship Course Pack.pdf',
    type: 'pdf',
    size: 2_450_000,
    uploadedAt: new Date('2026-02-20T10:00:00'),
  },
  {
    id: 'res-2',
    chatId: 'chat-1',
    name: 'RAG Architecture Notes.md',
    type: 'md',
    size: 12_800,
    uploadedAt: new Date('2026-02-28T09:30:00'),
  },
  {
    id: 'res-3',
    chatId: null,
    name: 'Lecture 4 - Business Model Canvas.txt',
    type: 'txt',
    size: 8_200,
    uploadedAt: new Date('2026-03-01T08:00:00'),
  },
];

export async function getResources(): Promise<Resource[]> {
  await delay(250);
  return MOCK_RESOURCES.map((r) => ({ ...r }));
}

export async function uploadResource(
  file: File,
  chatId: string | null,
  scope: ResourceScope,
): Promise<Resource> {
  await delay(800);
  const nameParts = file.name.split('.');
  const ext = nameParts[nameParts.length - 1].toLowerCase() as Resource['type'];
  const resource: Resource = {
    id: `res-${Date.now()}`,
    chatId: scope === 'global' ? null : chatId,
    name: file.name,
    type: ext,
    size: file.size,
    uploadedAt: new Date(),
  };
  MOCK_RESOURCES.unshift(resource);
  return { ...resource };
}

export async function deleteResource(resourceId: string): Promise<void> {
  await delay(200);
  const idx = MOCK_RESOURCES.findIndex((r) => r.id === resourceId);
  if (idx !== -1) MOCK_RESOURCES.splice(idx, 1);
}
