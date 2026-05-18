'use client';

import { useMenu } from '@/hooks/useMenu';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';

export default function PublicMenuPage() {
  const { menuItems, isLoading, error } = useMenu();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Our Menu</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && <Alert variant="error" message={error} />}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : menuItems.length === 0 ? (
          <p className="text-center text-slate-400 py-16">Menu coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div key={item._id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  {!item.available && <Badge variant="OUT_OF_STOCK" />}
                </div>
                <p className="mt-3 text-lg font-bold text-slate-900">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
