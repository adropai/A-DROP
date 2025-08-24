// ===============================================
// 🏪 Store مدیریت تیم و شیفت‌بندی
// ===============================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  TeamMember, 
  EmployeeRole, 
  ShiftSchedule, 
  DailyShift, 
  TeamStats,
  TeamMemberForm,
  ShiftScheduleForm,
  EmployeeRoleForm,
  TeamFilter,
  ShiftFilter,
  Permission,
  SystemUser
} from '@/types/team-management';

interface TeamManagementState {
  // State
  members: TeamMember[];
  roles: EmployeeRole[];
  permissions: Permission[];
  schedules: ShiftSchedule[];
  dailyShifts: DailyShift[];
  stats: TeamStats | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };

  // Filters
  filters: {
    members: TeamFilter;
    shifts: ShiftFilter;
  };

  // Team Members Actions
  fetchMembers: (filters?: TeamFilter) => Promise<void>;
  fetchMemberById: (id: string) => Promise<TeamMember | null>;
  createMember: (data: TeamMemberForm) => Promise<TeamMember | null>;
  updateMember: (id: string, data: Partial<TeamMemberForm>) => Promise<TeamMember | null>;
  deleteMember: (id: string) => Promise<boolean>;
  updateMemberStatus: (id: string, status: string) => Promise<boolean>;

  // Roles Actions
  fetchRoles: () => Promise<void>;
  fetchRoleById: (id: string) => Promise<EmployeeRole | null>;
  createRole: (data: EmployeeRoleForm) => Promise<EmployeeRole | null>;
  updateRole: (id: string, data: Partial<EmployeeRoleForm>) => Promise<EmployeeRole | null>;
  deleteRole: (id: string) => Promise<boolean>;
  assignRoleToMember: (memberId: string, roleId: string) => Promise<boolean>;

  // Permissions Actions
  fetchPermissions: () => Promise<void>;
  createPermission: (data: Partial<Permission>) => Promise<Permission | null>;
  updatePermission: (id: string, data: Partial<Permission>) => Promise<Permission | null>;
  deletePermission: (id: string) => Promise<boolean>;

  // Shift Schedule Actions
  fetchSchedules: (filters?: ShiftFilter) => Promise<void>;
  createSchedule: (data: ShiftScheduleForm) => Promise<ShiftSchedule | null>;
  updateSchedule: (id: string, data: Partial<ShiftScheduleForm>) => Promise<ShiftSchedule | null>;
  deleteSchedule: (id: string) => Promise<boolean>;
  duplicateSchedule: (id: string, newEmployeeId: string) => Promise<ShiftSchedule | null>;

  // Daily Shifts Actions
  fetchDailyShifts: (date?: Date, filters?: ShiftFilter) => Promise<void>;
  updateShiftStatus: (shiftId: string, status: string, notes?: string) => Promise<boolean>;
  checkIn: (shiftId: string, actualTime: string, checkedBy: string) => Promise<boolean>;
  checkOut: (shiftId: string, actualTime: string, checkedBy: string) => Promise<boolean>;
  recordOvertime: (shiftId: string, hours: number, reason: string) => Promise<boolean>;

  // Stats Actions
  fetchStats: () => Promise<void>;
  fetchDepartmentStats: (department: string) => Promise<any>;
  fetchPerformanceStats: (period: { start: Date; end: Date }) => Promise<any>;

  // System Users Actions
  users: SystemUser[];
  fetchUsers: (filters?: any) => Promise<void>;
  fetchUserById: (id: string) => Promise<SystemUser | null>;
  createUser: (data: any) => Promise<SystemUser | null>;
  updateUser: (id: string, data: any) => Promise<SystemUser | null>;
  deleteUser: (id: string) => Promise<boolean>;

  // Bulk Actions
  bulkUpdateSchedules: (memberIds: string[], scheduleData: Partial<ShiftScheduleForm>) => Promise<boolean>;
  generateScheduleForPeriod: (startDate: Date, endDate: Date, pattern: string) => Promise<boolean>;
  exportSchedules: (format: 'excel' | 'pdf', filters?: ShiftFilter) => Promise<string>;

  // Utility Actions
  setFilters: (type: 'members' | 'shifts', filters: any) => void;
  setPagination: (pagination: Partial<{ current: number; pageSize: number; total: number }>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetStore: () => void;
}

export const useTeamManagementStore = create<TeamManagementState>()(
  devtools(
    (set, get) => ({
      // Initial State
      members: [],
      roles: [],
      permissions: [],
      schedules: [],
      dailyShifts: [],
      stats: null,
      users: [],
      loading: false,
      error: null,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      filters: {
        members: {},
        shifts: {}
      },

      // Team Members Actions
      fetchMembers: async (filters?: TeamFilter) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters?.department) params.append('department', filters.department);
          if (filters?.status) params.append('status', filters.status);
          if (filters?.role) params.append('role', filters.role);
          
          const response = await fetch(`/api/team-management/members?${params}`);
          if (!response.ok) throw new Error('Failed to fetch members');
          
          const result = await response.json();
          set({ 
            members: result.data,
            pagination: { ...get().pagination, total: result.total },
            loading: false 
          });
        } catch (error) {
          set({ error: 'خطا در دریافت اعضای تیم', loading: false });
          console.error('Error fetching members:', error);
        }
      },

      fetchMemberById: async (id: string) => {
        try {
          const response = await fetch(`/api/team-management/members/${id}`);
          if (!response.ok) throw new Error('Failed to fetch member');
          
          const result = await response.json();
          return result.data;
        } catch (error) {
          console.error('Error fetching member:', error);
          return null;
        }
      },

      createMember: async (data: TeamMemberForm) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/team-management/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Failed to create member');
          
          const result = await response.json();
          const newMember = result.data;
          
          set(state => ({
            members: [...state.members, newMember],
            loading: false
          }));
          
          return newMember;
        } catch (error) {
          set({ error: 'خطا در ایجاد عضو جدید', loading: false });
          console.error('Error creating member:', error);
          return null;
        }
      },

      updateMember: async (id: string, data: Partial<TeamMemberForm>) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/team-management/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Failed to update member');
          
          const result = await response.json();
          const updatedMember = result.data;
          
          set(state => ({
            members: state.members.map(member => 
              member.id === id ? updatedMember : member
            ),
            loading: false
          }));
          
          return updatedMember;
        } catch (error) {
          set({ error: 'خطا در بروزرسانی عضو', loading: false });
          console.error('Error updating member:', error);
          return null;
        }
      },

      deleteMember: async (id: string) => {
        try {
          const response = await fetch(`/api/team-management/members/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete member');
          
          set(state => ({
            members: state.members.filter(member => member.id !== id)
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در حذف عضو' });
          console.error('Error deleting member:', error);
          return false;
        }
      },

      updateMemberStatus: async (id: string, status: string) => {
        try {
          const response = await fetch(`/api/team-management/members/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          
          if (!response.ok) throw new Error('Failed to update status');
          
          set(state => ({
            members: state.members.map(member => 
              member.id === id ? { ...member, status: status as any } : member
            )
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در بروزرسانی وضعیت' });
          console.error('Error updating status:', error);
          return false;
        }
      },

      // Roles Actions
      fetchRoles: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/team-management/roles');
          if (!response.ok) throw new Error('Failed to fetch roles');
          
          const result = await response.json();
          set({ roles: result.data, loading: false });
        } catch (error) {
          set({ error: 'خطا در دریافت نقش‌ها', loading: false });
          console.error('Error fetching roles:', error);
        }
      },

      fetchRoleById: async (id: string) => {
        try {
          const response = await fetch(`/api/team-management/roles/${id}`);
          if (!response.ok) throw new Error('Failed to fetch role');
          
          const result = await response.json();
          return result.data;
        } catch (error) {
          console.error('Error fetching role:', error);
          return null;
        }
      },

      createRole: async (data: EmployeeRoleForm) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/team-management/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Failed to create role');
          
          const result = await response.json();
          const newRole = result.data;
          
          set(state => ({
            roles: [...state.roles, newRole],
            loading: false
          }));
          
          return newRole;
        } catch (error) {
          set({ error: 'خطا در ایجاد نقش جدید', loading: false });
          console.error('Error creating role:', error);
          return null;
        }
      },

      updateRole: async (id: string, data: Partial<EmployeeRoleForm>) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/team-management/roles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Failed to update role');
          
          const result = await response.json();
          const updatedRole = result.data;
          
          set(state => ({
            roles: state.roles.map(role => 
              role.id === id ? updatedRole : role
            ),
            loading: false
          }));
          
          return updatedRole;
        } catch (error) {
          set({ error: 'خطا در بروزرسانی نقش', loading: false });
          console.error('Error updating role:', error);
          return null;
        }
      },

      deleteRole: async (id: string) => {
        try {
          const response = await fetch(`/api/team-management/roles/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete role');
          
          set(state => ({
            roles: state.roles.filter(role => role.id !== id)
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در حذف نقش' });
          console.error('Error deleting role:', error);
          return false;
        }
      },

      assignRoleToMember: async (memberId: string, roleId: string) => {
        try {
          const response = await fetch(`/api/team-management/members/${memberId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roleId })
          });
          
          if (!response.ok) throw new Error('Failed to assign role');
          
          // Update member in store
          await get().fetchMemberById(memberId);
          
          return true;
        } catch (error) {
          set({ error: 'خطا در تخصیص نقش' });
          console.error('Error assigning role:', error);
          return false;
        }
      },

      // Permissions Actions
      fetchPermissions: async () => {
        try {
          const response = await fetch('/api/team-management/permissions');
          if (!response.ok) throw new Error('Failed to fetch permissions');
          
          const result = await response.json();
          set({ permissions: result.data });
        } catch (error) {
          set({ error: 'خطا در دریافت مجوزها' });
          console.error('Error fetching permissions:', error);
        }
      },

      createPermission: async (data: Partial<Permission>) => {
        try {
          const response = await fetch('/api/team-management/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Failed to create permission');
          
          const result = await response.json();
          const newPermission = result.data;
          
          set(state => ({
            permissions: [...state.permissions, newPermission]
          }));
          
          return newPermission;
        } catch (error) {
          set({ error: 'خطا در ایجاد مجوز جدید' });
          console.error('Error creating permission:', error);
          return null;
        }
      },

      updatePermission: async (id: string, data: Partial<Permission>) => {
        try {
          const response = await fetch(`/api/team-management/permissions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Failed to update permission');
          
          const result = await response.json();
          const updatedPermission = result.data;
          
          set(state => ({
            permissions: state.permissions.map(permission => 
              permission === id ? updatedPermission : permission
            )
          }));
          
          return updatedPermission;
        } catch (error) {
          set({ error: 'خطا در بروزرسانی مجوز' });
          console.error('Error updating permission:', error);
          return null;
        }
      },

      deletePermission: async (id: string) => {
        try {
          const response = await fetch(`/api/team-management/permissions/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete permission');
          
          set(state => ({
            permissions: state.permissions.filter(permission => permission !== id)
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در حذف مجوز' });
          console.error('Error deleting permission:', error);
          return false;
        }
      },

      // Shift Schedule Actions
      fetchSchedules: async (filters?: ShiftFilter) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters?.employeeId) params.append('employeeId', filters.employeeId);
          if (filters?.department) params.append('department', filters.department);
          
          const response = await fetch(`/api/team-management/schedules?${params}`);
          if (!response.ok) throw new Error('Failed to fetch schedules');
          
          const result = await response.json();
          set({ schedules: result.data, loading: false });
        } catch (error) {
          set({ error: 'خطا در دریافت برنامه‌های شیفت', loading: false });
          console.error('Error fetching schedules:', error);
        }
      },

      createSchedule: async (data: ShiftScheduleForm) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/team-management/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Failed to create schedule');
          
          const result = await response.json();
          const newSchedule = result.data;
          
          set(state => ({
            schedules: [...state.schedules, newSchedule],
            loading: false
          }));
          
          return newSchedule;
        } catch (error) {
          set({ error: 'خطا در ایجاد برنامه شیفت', loading: false });
          console.error('Error creating schedule:', error);
          return null;
        }
      },

      updateSchedule: async (id: string, data: Partial<ShiftScheduleForm>) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/team-management/schedules/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) throw new Error('Failed to update schedule');
          
          const result = await response.json();
          const updatedSchedule = result.data;
          
          set(state => ({
            schedules: state.schedules.map(schedule => 
              schedule.id === id ? updatedSchedule : schedule
            ),
            loading: false
          }));
          
          return updatedSchedule;
        } catch (error) {
          set({ error: 'خطا در بروزرسانی برنامه شیفت', loading: false });
          console.error('Error updating schedule:', error);
          return null;
        }
      },

      deleteSchedule: async (id: string) => {
        try {
          const response = await fetch(`/api/team-management/schedules/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete schedule');
          
          set(state => ({
            schedules: state.schedules.filter(schedule => schedule.id !== id)
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در حذف برنامه شیفت' });
          console.error('Error deleting schedule:', error);
          return false;
        }
      },

      duplicateSchedule: async (id: string, newEmployeeId: string) => {
        try {
          const response = await fetch(`/api/team-management/schedules/${id}/duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newEmployeeId })
          });
          
          if (!response.ok) throw new Error('Failed to duplicate schedule');
          
          const result = await response.json();
          const newSchedule = result.data;
          
          set(state => ({
            schedules: [...state.schedules, newSchedule]
          }));
          
          return newSchedule;
        } catch (error) {
          set({ error: 'خطا در کپی برنامه شیفت' });
          console.error('Error duplicating schedule:', error);
          return null;
        }
      },

      // Daily Shifts Actions
      fetchDailyShifts: async (date?: Date, filters?: ShiftFilter) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (date) params.append('date', date.toISOString());
          if (filters?.employeeId) params.append('employeeId', filters.employeeId);
          if (filters?.department) params.append('department', filters.department);
          
          const response = await fetch(`/api/team-management/daily-shifts?${params}`);
          if (!response.ok) throw new Error('Failed to fetch daily shifts');
          
          const result = await response.json();
          set({ dailyShifts: result.data, loading: false });
        } catch (error) {
          set({ error: 'خطا در دریافت شیفت‌های روزانه', loading: false });
          console.error('Error fetching daily shifts:', error);
        }
      },

      updateShiftStatus: async (shiftId: string, status: string, notes?: string) => {
        try {
          const response = await fetch(`/api/team-management/daily-shifts/${shiftId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, notes })
          });
          
          if (!response.ok) throw new Error('Failed to update shift status');
          
          set(state => ({
            dailyShifts: state.dailyShifts.map(shift => 
              shift.id === shiftId ? { ...shift, status: status as any, notes } : shift
            )
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در بروزرسانی وضعیت شیفت' });
          console.error('Error updating shift status:', error);
          return false;
        }
      },

      checkIn: async (shiftId: string, actualTime: string, checkedBy: string) => {
        try {
          const response = await fetch(`/api/team-management/daily-shifts/${shiftId}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actualTime, checkedBy })
          });
          
          if (!response.ok) throw new Error('Failed to check in');
          
          set(state => ({
            dailyShifts: state.dailyShifts.map(shift => 
              shift.id === shiftId ? { 
                ...shift, 
                actualStartTime: actualTime, 
                checkedInBy: checkedBy,
                status: 'started' 
              } : shift
            )
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در ثبت ورود' });
          console.error('Error checking in:', error);
          return false;
        }
      },

      checkOut: async (shiftId: string, actualTime: string, checkedBy: string) => {
        try {
          const response = await fetch(`/api/team-management/daily-shifts/${shiftId}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actualTime, checkedBy })
          });
          
          if (!response.ok) throw new Error('Failed to check out');
          
          set(state => ({
            dailyShifts: state.dailyShifts.map(shift => 
              shift.id === shiftId ? { 
                ...shift, 
                actualEndTime: actualTime, 
                checkedOutBy: checkedBy,
                status: 'completed' 
              } : shift
            )
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در ثبت خروج' });
          console.error('Error checking out:', error);
          return false;
        }
      },

      recordOvertime: async (shiftId: string, hours: number, reason: string) => {
        try {
          const response = await fetch(`/api/team-management/daily-shifts/${shiftId}/overtime`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hours, reason })
          });
          
          if (!response.ok) throw new Error('Failed to record overtime');
          
          set(state => ({
            dailyShifts: state.dailyShifts.map(shift => 
              shift.id === shiftId ? { ...shift, overtime: hours } : shift
            )
          }));
          
          return true;
        } catch (error) {
          set({ error: 'خطا در ثبت اضافه کاری' });
          console.error('Error recording overtime:', error);
          return false;
        }
      },

      // Stats Actions
      fetchStats: async () => {
        try {
          const response = await fetch('/api/team-management/stats');
          if (!response.ok) throw new Error('Failed to fetch stats');
          
          const result = await response.json();
          set({ stats: result.data });
        } catch (error) {
          set({ error: 'خطا در دریافت آمار' });
          console.error('Error fetching stats:', error);
        }
      },

      fetchDepartmentStats: async (department: string) => {
        try {
          const response = await fetch(`/api/team-management/stats/department/${department}`);
          if (!response.ok) throw new Error('Failed to fetch department stats');
          
          const result = await response.json();
          return result.data;
        } catch (error) {
          console.error('Error fetching department stats:', error);
          return null;
        }
      },

      fetchPerformanceStats: async (period: { start: Date; end: Date }) => {
        try {
          const params = new URLSearchParams({
            start: period.start.toISOString(),
            end: period.end.toISOString()
          });
          
          const response = await fetch(`/api/team-management/stats/performance?${params}`);
          if (!response.ok) throw new Error('Failed to fetch performance stats');
          
          const result = await response.json();
          return result.data;
        } catch (error) {
          console.error('Error fetching performance stats:', error);
          return null;
        }
      },

      // Bulk Actions
      bulkUpdateSchedules: async (memberIds: string[], scheduleData: Partial<ShiftScheduleForm>) => {
        try {
          const response = await fetch('/api/team-management/schedules/bulk-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberIds, scheduleData })
          });
          
          if (!response.ok) throw new Error('Failed to bulk update schedules');
          
          // Refresh schedules
          await get().fetchSchedules();
          
          return true;
        } catch (error) {
          set({ error: 'خطا در بروزرسانی گروهی برنامه‌ها' });
          console.error('Error bulk updating schedules:', error);
          return false;
        }
      },

      generateScheduleForPeriod: async (startDate: Date, endDate: Date, pattern: string) => {
        try {
          const response = await fetch('/api/team-management/schedules/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate, endDate, pattern })
          });
          
          if (!response.ok) throw new Error('Failed to generate schedule');
          
          // Refresh daily shifts
          await get().fetchDailyShifts();
          
          return true;
        } catch (error) {
          set({ error: 'خطا در تولید برنامه شیفت' });
          console.error('Error generating schedule:', error);
          return false;
        }
      },

      exportSchedules: async (format: 'excel' | 'pdf', filters?: ShiftFilter) => {
        try {
          const params = new URLSearchParams({ format });
          if (filters?.employeeId) params.append('employeeId', filters.employeeId);
          if (filters?.department) params.append('department', filters.department);
          
          const response = await fetch(`/api/team-management/schedules/export?${params}`);
          if (!response.ok) throw new Error('Failed to export schedules');
          
          const result = await response.json();
          return result.downloadUrl;
        } catch (error) {
          set({ error: 'خطا در خروجی گیری برنامه‌ها' });
          console.error('Error exporting schedules:', error);
          return '';
        }
      },

      // Utility Actions
      setFilters: (type: 'members' | 'shifts', filters: any) => {
        set(state => ({
          filters: {
            ...state.filters,
            [type]: filters
          }
        }));
      },

      setPagination: (pagination: Partial<{ current: number; pageSize: number; total: number }>) => {
        set(state => ({
          pagination: { ...state.pagination, ...pagination }
        }));
      },

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // System Users Actions
      fetchUsers: async (filters?: any) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters?.search) params.append('search', filters.search);
          if (filters?.role) params.append('role', filters.role);
          if (filters?.status) params.append('status', filters.status);
          if (filters?.page) params.append('page', filters.page.toString());
          if (filters?.limit) params.append('limit', filters.limit.toString());

          const response = await fetch(`/api/team-management/users?${params}`);
          const result = await response.json();

          if (result.success) {
            set({ 
              users: result.data,
              pagination: result.pagination,
              loading: false 
            });
          } else {
            set({ error: result.error, loading: false });
          }
        } catch (error) {
          set({ error: 'خطا در دریافت کاربران', loading: false });
        }
      },

      fetchUserById: async (id: string) => {
        try {
          const response = await fetch(`/api/team-management/users/${id}`);
          const result = await response.json();
          return result.success ? result.data : null;
        } catch (error) {
          console.error('Error fetching user:', error);
          return null;
        }
      },

      createUser: async (data: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/team-management/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const result = await response.json();

          if (result.success) {
            const currentUsers = get().users;
            set({ 
              users: [...currentUsers, result.data],
              loading: false 
            });
            return result.data;
          } else {
            set({ error: result.error, loading: false });
            return null;
          }
        } catch (error) {
          set({ error: 'خطا در ایجاد کاربر', loading: false });
          return null;
        }
      },

      updateUser: async (id: string, data: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/team-management/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const result = await response.json();

          if (result.success) {
            const currentUsers = get().users;
            const updatedUsers = currentUsers.map(user => 
              user.id === id ? result.data : user
            );
            set({ 
              users: updatedUsers,
              loading: false 
            });
            return result.data;
          } else {
            set({ error: result.error, loading: false });
            return null;
          }
        } catch (error) {
          set({ error: 'خطا در به‌روزرسانی کاربر', loading: false });
          return null;
        }
      },

      deleteUser: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/team-management/users/${id}`, {
            method: 'DELETE'
          });
          const result = await response.json();

          if (result.success) {
            const currentUsers = get().users;
            const filteredUsers = currentUsers.filter(user => user.id !== id);
            set({ 
              users: filteredUsers,
              loading: false 
            });
            return true;
          } else {
            set({ error: result.error, loading: false });
            return false;
          }
        } catch (error) {
          set({ error: 'خطا در حذف کاربر', loading: false });
          return false;
        }
      },

      resetStore: () => set({
        members: [],
        roles: [],
        permissions: [],
        schedules: [],
        dailyShifts: [],
        stats: null,
        users: [],
        loading: false,
        error: null,
        pagination: { current: 1, pageSize: 10, total: 0 },
        filters: { members: {}, shifts: {} }
      })
    }),
    {
      name: 'team-management-store'
    }
  )
);
