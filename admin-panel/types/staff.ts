// TypeScript types for Staff Management
export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: 'kitchen' | 'service' | 'management' | 'delivery' | 'cashier';
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'onLeave';
  permissions: string[];
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  shifts: Shift[];
  performance: PerformanceMetrics;
}

export interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  type: 'regular' | 'overtime' | 'holiday';
  status: 'scheduled' | 'completed' | 'absent' | 'late';
}

export interface PerformanceMetrics {
  attendanceRate: number;
  customerRating: number;
  tasksCompleted: number;
  punctualityScore: number;
  salesTarget?: number;
  salesAchieved?: number;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  onLeave: number;
  totalSalary: number;
  averagePerformance: number;
  topPerformers: Staff[];
}
