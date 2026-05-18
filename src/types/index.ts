// ─── Shared enums ────────────────────────────────────────────────────────────

export type ItemStatus = 'ACTIVE' | 'INACTIVE';
export type StockStatus = 'OK' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
export type OrderStatus = 'CONFIRMED' | 'CANCELLED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type CouponStatus = 'ACTIVE' | 'DEACTIVATED';
export type MovementType = 'MANUAL_IN' | 'MANUAL_OUT' | 'ORDER_DEDUCTION' | 'DAILY_RESET';

// ─── Domain entities (mirrors data-model.md) ─────────────────────────────────

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface IInventoryItem {
  _id: string;
  name: string;
  categoryId: string;
  unit: string;
  currentQuantity: number;
  minimumThreshold: number;
  criticalThreshold: number;
  parLevel: number;
  status: ItemStatus;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IMenuItem {
  _id: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  inventoryItemId: string;
  status: ItemStatus;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IOrder {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  couponId?: string;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IBrandingSnapshot {
  restaurantName: string;
  address?: string;
  logoUrl?: string;
  footerText?: string;
  terms?: string;
  currencySymbol: string;
}

export interface IInvoice {
  _id: string;
  orderId: string;
  brandingSnapshot: IBrandingSnapshot;
  generatedAt: string;
}

export interface IInvoiceTemplate {
  _id: string;
  restaurantName: string;
  address?: string;
  logoUrl?: string;
  footerText?: string;
  terms?: string;
  currencySymbol: string;
  updatedAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number;
  usesRemaining: number;
  expiryDate: string;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IStockMovement {
  _id: string;
  inventoryItemId: string;
  inventoryItemName?: string;
  movementType: MovementType;
  quantityDelta: number;
  orderId?: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  inventoryItemId: string;
}

export interface CreateInventoryItemRequest {
  name: string;
  categoryId: string;
  unit: string;
  currentQuantity: number;
  minimumThreshold: number;
  criticalThreshold: number;
  parLevel: number;
}

export interface UpdateInventoryItemRequest extends Partial<CreateInventoryItemRequest> {}

export interface StockMovementRequest {
  movementType: 'MANUAL_IN' | 'MANUAL_OUT';
  quantityDelta: number;
  notes?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  couponCode?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}

export interface CouponValidationRequest {
  code: string;
  orderTotal: number;
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  coupon?: ICoupon;
  discountAmount: number;
  newTotal: number;
}

export interface CreateCouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number;
  expiryDate: string;
}

export interface UpdateInvoiceTemplateRequest {
  restaurantName: string;
  address?: string;
  logoUrl?: string;
  footerText?: string;
  terms?: string;
  currencySymbol: string;
}

export interface MovementFilters {
  itemId?: string;
  movementType?: MovementType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Cart (client-side POS state) ────────────────────────────────────────────

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}
