import { useAuthStore } from '@/store/authStore';
import { gateway } from '@/lib/gateway';
import type { IInvoiceTemplate, UpdateInvoiceTemplateRequest } from '@/types';

export async function downloadInvoice(orderId: string): Promise<void> {
  const { accessToken } = useAuthStore.getState();
  const res = await fetch(`/api/v1/admin/orders/${orderId}/invoice`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) throw new Error('Failed to download invoice');

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `invoice-${orderId}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function getTemplate(): Promise<IInvoiceTemplate> {
  return gateway.get<IInvoiceTemplate>('/admin/invoice-template');
}

export async function updateTemplate(dto: UpdateInvoiceTemplateRequest): Promise<IInvoiceTemplate> {
  return gateway.put<IInvoiceTemplate>('/admin/invoice-template', dto);
}
