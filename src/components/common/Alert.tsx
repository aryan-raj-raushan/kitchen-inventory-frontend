'use client';

import { useState } from 'react';

type AlertVariant = 'error' | 'warning' | 'success' | 'info';

const variantClasses: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  dismissible?: boolean;
}

export function Alert({ variant = 'info', message, dismissible = true }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm ${variantClasses[variant]}`}
    >
      <span>{message}</span>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 font-medium hover:opacity-70"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
