import 'server-only';
import { MenuItem } from '../models/MenuItem';
import { InventoryItem } from '../models/InventoryItem';
import type { IMenuItem } from '@/types';

interface MenuItemWithAvailability extends Omit<IMenuItem, '_id'> {
  _id: string;
  available: boolean;
}

export async function findActiveMenuItemsWithAvailability(): Promise<MenuItemWithAvailability[]> {
  const items = await MenuItem.aggregate([
    { $match: { status: 'ACTIVE' } },
    {
      $lookup: {
        from: InventoryItem.collection.name,
        localField: 'inventoryItemId',
        foreignField: '_id',
        as: 'inventoryItem',
      },
    },
    { $unwind: { path: '$inventoryItem', preserveNullAndEmptyArrays: false } },
    {
      $addFields: {
        available: {
          $and: [
            { $eq: ['$inventoryItem.status', 'ACTIVE'] },
            { $gt: ['$inventoryItem.currentQuantity', 0] },
          ],
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        categoryId: 1,
        price: 1,
        inventoryItemId: 1,
        status: 1,
        available: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return items.map((item) => ({
    ...item,
    _id: item._id.toString(),
    categoryId: item.categoryId.toString(),
    inventoryItemId: item.inventoryItemId.toString(),
  }));
}
