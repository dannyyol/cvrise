import { api } from '../lib/apiClient';
import type { CVPayload } from '../lib/payloadBuilder';

export async function exportResumeToPDF(payload: CVPayload, filename = 'cv.pdf') {
  try {
    const res = await api.client.post('/export-pdf', payload, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}
