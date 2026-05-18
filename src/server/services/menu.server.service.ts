import 'server-only';
import { findActiveMenuItemsWithAvailability } from '../repositories/menu.repository';

export async function getPublicMenu() {
  return findActiveMenuItemsWithAvailability();
}
