'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertVariant = 'error' | 'warning' | 'success' | 'info';

const variantClasses: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  info: 'bg-indigo-50 border-indigo-200 text-indigo-700',
};

const icons: Record<AlertVariant, React.ComponentType<{ size?: number; className?: string }>> = {
  error: XCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  dismissible?: boolean;
}

export function Alert({ variant = 'info', message, dismissible = true }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${variantClasses[variant]}`}
    >
      <Icon size={15} className="shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
