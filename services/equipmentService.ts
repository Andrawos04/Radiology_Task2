import { supabase } from '../lib/supabase';
import type { Equipment, EquipmentFormData } from '../types';

export const fetchAllEquipment = async (): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching equipment:', error);
    throw new Error('Failed to fetch equipment');
  }

  return data || [];
};

export const addEquipment = async (formData: EquipmentFormData): Promise<Equipment> => {
  const equipmentData = {
    inventory_code: formData.inventory_code,
    equipment_name: formData.equipment_name,
    equipment_type_id: formData.equipment_type_id,
    manufacturer_id: formData.manufacturer_id,
    model_number: formData.model_number,
    serial_number: formData.serial_number,
    year_manufactured: formData.year_manufactured ? parseInt(formData.year_manufactured, 10) : null,
    purchase_date: formData.purchase_date || null,
    installation_date: formData.installation_date || null,
    warranty_expiry_date: formData.warranty_expiry_date || null,
    purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
    current_value: formData.current_value ? parseFloat(formData.current_value) : null,
    ownership_type: formData.ownership_type,
    room_id: formData.room_id,
    equipment_status: formData.equipment_status,
    condition_rating: formData.condition_rating,
    funding_id: formData.funding_id || null,
  };

  const { data, error } = await supabase
    .from('equipment')
    .insert([equipmentData])
    .select()
    .single();

  if (error) {
    console.error('Error adding equipment:', error);
    throw new Error('Failed to add equipment');
  }

  return data;
};

export const fetchReferenceData = async () => {
  const [
    { data: buildings, error: buildingsError },
    { data: departments, error: departmentsError },
    { data: rooms, error: roomsError },
    { data: manufacturers, error: manufacturersError },
    { data: equipmentTypes, error: equipmentTypesError },
    { data: fundingSources, error: fundingSourcesError }
  ] = await Promise.all([
    supabase.from('buildings').select('*').order('building_name'),
    supabase.from('departments').select('*').order('dept_name'),
    supabase.from('rooms').select('*').order('room_name'),
    supabase.from('manufacturers').select('*').order('manufacturer_name'),
    supabase.from('equipment_types').select('*').order('type_name'),
    supabase.from('funding_sources').select('*').order('funding_name')
  ]);

  if (buildingsError || departmentsError || roomsError || manufacturersError || equipmentTypesError || fundingSourcesError) {
    console.error('Error fetching reference data:', {
      buildingsError,
      departmentsError,
      roomsError,
      manufacturersError,
      equipmentTypesError,
      fundingSourcesError
    });
    throw new Error('Failed to fetch reference data');
  }

  return {
    buildings: buildings || [],
    departments: departments || [],
    rooms: rooms || [],
    manufacturers: manufacturers || [],
    equipmentTypes: equipmentTypes || [],
    fundingSources: fundingSources || []
  };
};