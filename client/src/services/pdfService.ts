import { api } from '../lib/apiClient';
import type { CVPayload } from '../lib/payloadBuilder';

export async function generateResumePDFBlob(payload: CVPayload): Promise<Blob> {
  const prepare = await api.post<CVPayload, { exportToken: string; expiresAt: string }>('/export-pdf/prepare', payload);
  const res = await api.client.post('/export-pdf', { exportToken: prepare.exportToken }, { responseType: 'blob' });
  return new Blob([res.data], { type: 'application/pdf' });
}

export async function exportResumeToPDF(payload: CVPayload, filename = 'cv.pdf') {
  try {
    const blob = await generateResumePDFBlob(payload);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}
