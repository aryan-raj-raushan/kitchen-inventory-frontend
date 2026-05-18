'use client';

import { useState, useEffect } from 'react';
import { getMenu } from '@/services/menu.service';
import type { IMenuItem } from '@/types';

export function useMenu() {
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMenu()
      .then(setMenuItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load menu'))
      .finally(() => setIsLoading(false));
  }, []);

  const grouped = menuItems.reduce<Record<string, IMenuItem[]>>((acc, item) => {
    const key = item.categoryId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return { menuItems, grouped, isLoading, error };
}
