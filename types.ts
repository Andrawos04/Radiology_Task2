
export interface Building {
  building_id: number;
  building_code: string;
  building_name: string;
}

export interface Department {
  department_id: number;
  dept_code: string;
  dept_name: string;
  building_id: number;
}

export interface Room {
  room_id: number;
  room_code: string;
  room_name: string;
  department_id: number;
  floor_number: number;
}

export interface Manufacturer {
  manufacturer_id: number;
  manufacturer_code: string;
  manufacturer_name: string;
}

export interface EquipmentType {
  equipment_type_id: number;
  type_code: string;
  type_name: string;
  gmdn_code: string;
}

export interface FundingSource {
    funding_id: number;
    funding_code: string;
    funding_name: string;
}

export interface Equipment {
  equipment_id: number;
  inventory_code: string;
  equipment_name: string;
  equipment_type_id: number;
  manufacturer_id: number;
  model_number: string;
  serial_number: string;
  year_manufactured?: number;
  purchase_date?: string;
  installation_date?: string;
  commissioning_date?: string;
  warranty_expiry_date?: string;
  purchase_price?: number;
  current_value?: number;
  ownership_type: 'OWNED' | 'LEASED' | 'RENTAL';
  room_id: number;
  equipment_status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'DECOMMISSIONED';
  condition_rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_frequency_days?: number;
  funding_id?: number;
}

export interface EquipmentFormData {
  inventory_code: string;
  equipment_name: string;
  equipment_type_id: number;
  manufacturer_id: number;
  model_number: string;
  serial_number: string;
  year_manufactured?: string;
  purchase_date?: string;
  installation_date?: string;
  warranty_expiry_date?: string;
  purchase_price?: string;
  current_value?: string;
  ownership_type: 'OWNED' | 'LEASED' | 'RENTAL';
  room_id: number;
  equipment_status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'DECOMMISSIONED';
  condition_rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  funding_id?: number;
}

export interface EquipmentFilter {
  searchText?: string;
  equipment_type?: string[];
  status?: string[];
  manufacturer?: string[];
  purchase_year_min?: number;
  purchase_year_max?: number;
  maintenance_due_in_days?: number;
}

export type SortDirection = 'ascending' | 'descending';

export interface SortConfig {
  key: keyof Equipment | 'manufacturer_name' | 'type_name' | 'dept_name';
  direction: SortDirection;
}

export interface ToastType {
    message: string;
    type: 'success' | 'error';
}
