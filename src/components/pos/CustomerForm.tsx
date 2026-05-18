'use client';

interface CustomerFormProps {
  name: string;
  phone: string;
  onChange: (field: 'name' | 'phone', value: string) => void;
}

export function CustomerForm({ name, phone, onChange }: CustomerFormProps) {
  const inputClass =
    'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Full name"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+1 555-0000"
          className={inputClass}
        />
      </div>
    </div>
  );
}
