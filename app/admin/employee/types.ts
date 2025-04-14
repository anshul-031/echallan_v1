export interface Privileges {
  dashboard_view: boolean;
  dashboard_add: boolean;
  dashboard_edit: boolean;
  customer_view: boolean;
  customer_add: boolean;
  customer_edit: boolean;
  employee_view: boolean;
  employee_add: boolean;
  employee_edit: boolean;
  user_view: boolean;
  user_add: boolean;
  user_edit: boolean;
  vehicle_view: boolean;
  vehicle_add: boolean;
  vehicle_edit: boolean;
  administrator_view: boolean;
  administrator_add: boolean;
  administrator_edit: boolean;
  bulk_data_access: boolean;
  other_options_access: boolean;
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  phone: string;
  image?: string;
  address: string;
  location: string;
  role: string;
  designation: string;
  doj: string;
  reportTo?: string;
  assignedUsers: string[];
  status: boolean;
  privileges: Privileges;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  location: string;
  role: string;
  designation: string;
  doj: string;
  reportTo?: string;
  assignedUsers: string[];
  image?: string;
  privileges: Privileges;
}

export const defaultPrivileges: Privileges = {
  dashboard_view: true,
  dashboard_add: false,
  dashboard_edit: false,
  customer_view: true,
  customer_add: false,
  customer_edit: false,
  employee_view: false,
  employee_add: false,
  employee_edit: false,
  user_view: true,
  user_add: false,
  user_edit: false,
  vehicle_view: true,
  vehicle_add: false,
  vehicle_edit: false,
  administrator_view: false,
  administrator_add: false,
  administrator_edit: false,
  bulk_data_access: false,
  other_options_access: false,
} as const;