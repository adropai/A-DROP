// Multi-Branch Management System
// Core system for managing multiple restaurant branches with separate configurations

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  timezone: string;
  currency: string;
  settings: BranchSettings;
  operatingHours: OperatingHours[];
  staff: BranchStaff[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchSettings {
  allowOnlineOrders: boolean;
  allowTableReservations: boolean;
  enableDelivery: boolean;
  enableTakeout: boolean;
  enableDineIn: boolean;
  taxRate: number;
  serviceCharge: number;
  deliveryRadius: number;
  minimumOrderAmount: number;
  maxTablesPerReservation: number;
  autoAcceptOrders: boolean;
  printerSettings: PrinterSettings;
  paymentMethods: string[];
  loyaltyProgram: boolean;
}

export interface OperatingHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  openTime: string; // "09:00"
  closeTime: string; // "23:00"
  isOpen: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface BranchStaff {
  userId: string;
  role: 'manager' | 'cashier' | 'chef' | 'waiter' | 'delivery';
  permissions: string[];
  schedule: StaffSchedule[];
  isActive: boolean;
}

export interface StaffSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface PrinterSettings {
  receiptPrinter: string;
  kitchenPrinter: string;
  enableAutoPrint: boolean;
}

export interface BranchMenu {
  branchId: string;
  categories: MenuCategory[];
  specialOffers: SpecialOffer[];
  isActive: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
  isAvailable: boolean;
  availableHours?: {
    start: string;
    end: string;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For branch-specific pricing
  images: string[];
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  availability: ItemAvailability;
  modifiers: ItemModifier[];
}

export interface ItemAvailability {
  isAvailable: boolean;
  quantity?: number;
  availableDays: number[];
  availableHours?: {
    start: string;
    end: string;
  };
}

export interface ItemModifier {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_get';
  value: number;
  minOrderAmount?: number;
  validFrom: Date;
  validTo: Date;
  applicableItems?: string[];
  maxUsagePerCustomer?: number;
  isActive: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export class MultiBranchManager {
  private branches: Map<string, Branch> = new Map();
  private branchMenus: Map<string, BranchMenu> = new Map();

  // Branch Management
  createBranch(branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBranch: Branch = {
      ...branch,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.branches.set(id, newBranch);
    return id;
  }

  getBranch(branchId: string): Branch | undefined {
    return this.branches.get(branchId);
  }

  getAllBranches(): Branch[] {
    return Array.from(this.branches.values());
  }

  updateBranch(branchId: string, updates: Partial<Branch>): boolean {
    const branch = this.branches.get(branchId);
    if (!branch) return false;

    const updatedBranch = {
      ...branch,
      ...updates,
      updatedAt: new Date()
    };
    this.branches.set(branchId, updatedBranch);
    return true;
  }

  deleteBranch(branchId: string): boolean {
    return this.branches.delete(branchId);
  }

  // Branch Status Management
  setBranchStatus(branchId: string, status: Branch['status']): boolean {
    return this.updateBranch(branchId, { status });
  }

  getBranchesByStatus(status: Branch['status']): Branch[] {
    return this.getAllBranches().filter(branch => branch.status === status);
  }

  // Staff Management
  addStaffToBranch(branchId: string, staff: BranchStaff): boolean {
    const branch = this.branches.get(branchId);
    if (!branch) return false;

    branch.staff.push(staff);
    branch.updatedAt = new Date();
    return true;
  }

  removeStaffFromBranch(branchId: string, userId: string): boolean {
    const branch = this.branches.get(branchId);
    if (!branch) return false;

    branch.staff = branch.staff.filter(staff => staff.userId !== userId);
    branch.updatedAt = new Date();
    return true;
  }

  updateStaffPermissions(branchId: string, userId: string, permissions: string[]): boolean {
    const branch = this.branches.get(branchId);
    if (!branch) return false;

    const staffMember = branch.staff.find(staff => staff.userId === userId);
    if (!staffMember) return false;

    staffMember.permissions = permissions;
    branch.updatedAt = new Date();
    return true;
  }

  // Menu Management
  setBranchMenu(branchId: string, menu: Omit<BranchMenu, 'branchId'>): boolean {
    const branch = this.branches.get(branchId);
    if (!branch) return false;

    const branchMenu: BranchMenu = {
      ...menu,
      branchId
    };
    this.branchMenus.set(branchId, branchMenu);
    return true;
  }

  getBranchMenu(branchId: string): BranchMenu | undefined {
    return this.branchMenus.get(branchId);
  }

  updateMenuItemPrice(branchId: string, itemId: string, price: number): boolean {
    const menu = this.branchMenus.get(branchId);
    if (!menu) return false;

    for (const category of menu.categories) {
      const item = category.items.find(item => item.id === itemId);
      if (item) {
        item.price = price;
        return true;
      }
    }
    return false;
  }

  setItemAvailability(branchId: string, itemId: string, availability: ItemAvailability): boolean {
    const menu = this.branchMenus.get(branchId);
    if (!menu) return false;

    for (const category of menu.categories) {
      const item = category.items.find(item => item.id === itemId);
      if (item) {
        item.availability = availability;
        return true;
      }
    }
    return false;
  }

  // Operating Hours Management
  updateOperatingHours(branchId: string, hours: OperatingHours[]): boolean {
    return this.updateBranch(branchId, { operatingHours: hours });
  }

  isBranchOpen(branchId: string, date: Date = new Date()): boolean {
    const branch = this.branches.get(branchId);
    if (!branch || branch.status !== 'active') return false;

    const dayOfWeek = date.getDay();
    const currentTime = date.toTimeString().substring(0, 5); // "HH:MM"

    const todayHours = branch.operatingHours.find(hours => hours.dayOfWeek === dayOfWeek);
    if (!todayHours || !todayHours.isOpen) return false;

    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  }

  // Analytics & Reporting
  getBranchStatistics(branchId: string, dateRange: { from: Date; to: Date }) {
    // This would typically integrate with order and analytics systems
    return {
      branchId,
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      customerCount: 0,
      mostPopularItems: [],
      busyHours: [],
      dateRange
    };
  }

  getMultiBranchReport(dateRange: { from: Date; to: Date }) {
    const branches = this.getAllBranches();
    return branches.map(branch => ({
      branch,
      statistics: this.getBranchStatistics(branch.id, dateRange)
    }));
  }

  // Settings Management
  updateBranchSettings(branchId: string, settings: Partial<BranchSettings>): boolean {
    const branch = this.branches.get(branchId);
    if (!branch) return false;

    branch.settings = { ...branch.settings, ...settings };
    branch.updatedAt = new Date();
    return true;
  }

  // Bulk Operations
  bulkUpdateSettings(branchIds: string[], settings: Partial<BranchSettings>): boolean {
    let allSuccessful = true;
    for (const branchId of branchIds) {
      if (!this.updateBranchSettings(branchId, settings)) {
        allSuccessful = false;
      }
    }
    return allSuccessful;
  }

  syncMenuAcrossBranches(sourceBranchId: string, targetBranchIds: string[]): boolean {
    const sourceMenu = this.branchMenus.get(sourceBranchId);
    if (!sourceMenu) return false;

    for (const targetBranchId of targetBranchIds) {
      this.setBranchMenu(targetBranchId, {
        categories: sourceMenu.categories,
        specialOffers: sourceMenu.specialOffers,
        isActive: sourceMenu.isActive
      });
    }
    return true;
  }
}

// Example usage:
// const branchManager = new MultiBranchManager();
// const branchId = branchManager.createBranch({...branchData});
// branchManager.setBranchMenu(branchId, {...menuData});
