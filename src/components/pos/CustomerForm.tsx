'use client';

interface CustomerFormProps {
  name: string;
  phone: string;
  onChange: (field: 'name' | 'phone', value: string) => void;
}

export function CustomerForm({ name, phone, onChange }: CustomerFormProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Full name"
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+1 555-0000"
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
