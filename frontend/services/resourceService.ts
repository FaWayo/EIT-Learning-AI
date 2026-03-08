import { Resource, ResourceType, ProcessingStatus, BackendDocument, BackendUploadResponse, BackendDocumentStatus } from '@/types';
import { apiGet, apiPostFormData } from './apiClient';

function mapBackendDocToResource(doc: BackendDocument): Resource {
  const nameParts = doc.title.split('.');
  const ext = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : 'txt';
  const validTypes: ResourceType[] = ['pdf', 'txt', 'md'];
  const type: ResourceType = validTypes.includes(ext as ResourceType) ? (ext as ResourceType) : 'txt';

  return {
    id: doc.id,
    backendId: doc.id,
    chatId: null,
    name: doc.title,
    type,
    size: 0,
    status: (doc.status as ProcessingStatus) || 'queued',
    uploadedAt: new Date(doc.created_at),
  };
}

export async function getResources(): Promise<Resource[]> {
  const docs = await apiGet<BackendDocument[]>('/documents');
  return docs.map(mapBackendDocToResource);
}

export async function uploadResource(
  file: File,
  _chatId: string | null,
  _scope: string,
): Promise<Resource> {
  const formData = new FormData();
  formData.append('files', file);

  const response = await apiPostFormData<BackendUploadResponse>('/documents/upload', formData);
  const created = response.documents[0];

  const nameParts = file.name.split('.');
  const ext = nameParts[nameParts.length - 1].toLowerCase() as ResourceType;

  return {
    id: created.id,
    backendId: created.id,
    chatId: null,
    name: file.name,
    type: ext,
    size: file.size,
    status: (created.status as ProcessingStatus) || 'queued',
    uploadedAt: new Date(),
  };
}

export async function deleteResource(_resourceId: string): Promise<void> {
  // Backend has no delete endpoint — frontend-only removal
}

export async function getDocumentStatus(documentId: string): Promise<ProcessingStatus> {
  const data = await apiGet<BackendDocumentStatus>(`/documents/${documentId}/status`);
  return (data.status as ProcessingStatus) || 'queued';
}
