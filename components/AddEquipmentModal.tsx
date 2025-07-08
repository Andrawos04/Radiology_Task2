
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { EquipmentFormData, Equipment } from '../types';
import { EQUIPMENT_TYPES, MANUFACTURERS, BUILDINGS, DEPARTMENTS, ROOMS, FUNDING_SOURCES, EQUIPMENT_TYPE_MAP, ROOM_MAP, DEPARTMENT_MAP } from '../constants';
import Icon from './Icon';

interface AddEquipmentModalProps {
    onClose: () => void;
    onSave: (formData: EquipmentFormData) => void;
    existingEquipment: Equipment[];
}

const InputField: React.FC<{ label: string; name: keyof EquipmentFormData; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string; disabled?: boolean }> = 
    ({ label, name, value, onChange, required, type = "text", disabled=false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} disabled={disabled}
               className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 text-gray-900" />
    </div>
);

const SelectField: React.FC<{ label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string | number; label: string }[]; required?: boolean }> =
    ({ label, name, value, onChange, options, required }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <div className="relative mt-1">
            <select id={name} name={name} value={value} onChange={onChange} required={required}
                    className="appearance-none block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-white text-gray-900">
                <option value="" disabled>Select {label}</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <Icon name="chevron-down" className="w-4 h-4" />
            </div>
        </div>
    </div>
);


const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ onClose, onSave, existingEquipment }) => {
    const [formData, setFormData] = useState<EquipmentFormData>({
        inventory_code: '', equipment_name: '', equipment_type_id: 0, manufacturer_id: 0, model_number: '', serial_number: '',
        room_id: 0, ownership_type: 'OWNED', equipment_status: 'ACTIVE', condition_rating: 'GOOD',
        year_manufactured: new Date().getFullYear().toString(), purchase_date: '', installation_date: '', warranty_expiry_date: '',
        purchase_price: '', current_value: '', funding_id: undefined,
    });
    
    const [selectedBuilding, setSelectedBuilding] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let finalValue: any = value;
        if (['equipment_type_id', 'manufacturer_id', 'room_id', 'funding_id', 'year_manufactured'].includes(name)) {
            finalValue = value ? parseInt(value, 10) : 0;
            if(isNaN(finalValue)) finalValue = 0;
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBuilding(e.target.value);
        setSelectedDepartment('');
        setFormData(prev => ({...prev, room_id: 0})); // Reset room when building changes
    }

    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDepartment(e.target.value);
        setFormData(prev => ({...prev, room_id: 0})); // Reset room when department changes
    }
    
    const filteredDepartments = useMemo(() => {
        if (!selectedBuilding) return [];
        return DEPARTMENTS.filter(d => d.building_id === parseInt(selectedBuilding, 10));
    }, [selectedBuilding]);

    const filteredRooms = useMemo(() => {
        if (!selectedDepartment) return [];
        return ROOMS.filter(r => r.department_id === parseInt(selectedDepartment, 10));
    }, [selectedDepartment]);


    const generateInventoryCode = useCallback(() => {
        if (!formData.equipment_type_id || !formData.room_id) {
            return 'Select Type & Room';
        }

        const type = EQUIPMENT_TYPE_MAP.get(formData.equipment_type_id);
        const room = ROOM_MAP.get(formData.room_id);
        const department = room ? DEPARTMENT_MAP.get(room.department_id) : null;
        
        if(!type || !room || !department) return 'Invalid selection';

        const prefix = `${type.type_code}-${department.dept_code}-${room.floor_number}-${room.room_code}`;
        const existingForLocation = existingEquipment.filter(e => e.inventory_code.startsWith(prefix));
        const nextId = existingForLocation.length + 1;
        const sequentialID = nextId.toString().padStart(4, '0');
        
        return `${prefix}-${sequentialID}`;

    }, [formData.equipment_type_id, formData.room_id, existingEquipment]);

    useEffect(() => {
        setFormData(prev => ({...prev, inventory_code: generateInventoryCode()}));
    }, [generateInventoryCode]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.equipment_name || !formData.equipment_type_id || !formData.manufacturer_id || !formData.room_id) {
            alert('Please fill out all required fields, including Equipment Type, Manufacturer, and Room.');
            return;
        }
        if (formData.inventory_code.includes(' ')) {
            alert('Please complete location and type selection to generate a valid Inventory Code.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative w-full max-w-3xl shadow-2xl rounded-xl bg-white flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">Add New Equipment</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                      <Icon name="close" className="w-6 h-6" />
                    </button>
                </div>
                <form id="add-equipment-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Equipment Name" name="equipment_name" value={formData.equipment_name} onChange={handleInputChange} required />
                        <InputField label="Inventory Code" name="inventory_code" value={formData.inventory_code} onChange={()=>{}} disabled />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField label="Equipment Type" name="equipment_type_id" value={formData.equipment_type_id || ''} onChange={handleInputChange} options={EQUIPMENT_TYPES.map(t => ({ value: t.equipment_type_id, label: t.type_name }))} required />
                        <SelectField label="Manufacturer" name="manufacturer_id" value={formData.manufacturer_id || ''} onChange={handleInputChange} options={MANUFACTURERS.map(m => ({ value: m.manufacturer_id, label: m.manufacturer_name }))} required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Model Number" name="model_number" value={formData.model_number} onChange={handleInputChange} required />
                        <InputField label="Serial Number" name="serial_number" value={formData.serial_number} onChange={handleInputChange} required />
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-semibold text-md text-gray-800 border-t pt-6">Location</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SelectField label="Building" name="building_id" value={selectedBuilding} onChange={handleBuildingChange} options={BUILDINGS.map(b => ({ value: b.building_id, label: b.building_name }))} required />
                            <SelectField label="Department" name="department_id" value={selectedDepartment} onChange={handleDepartmentChange} options={filteredDepartments.map(d => ({ value: d.department_id, label: d.dept_name }))} required />
                            <SelectField label="Room" name="room_id" value={formData.room_id || ''} onChange={handleInputChange} options={filteredRooms.map(r => ({ value: r.room_id, label: r.room_name }))} required />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-md text-gray-800 border-t pt-6">Details</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SelectField label="Ownership" name="ownership_type" value={formData.ownership_type} onChange={handleInputChange} options={[{value: 'OWNED', label: 'Owned'}, {value: 'LEASED', label: 'Leased'}, {value: 'RENTAL', label: 'Rental'}]} required />
                            <SelectField label="Status" name="equipment_status" value={formData.equipment_status} onChange={handleInputChange} options={[{value: 'ACTIVE', label: 'Active'}, {value: 'MAINTENANCE', label: 'Maintenance'}, {value: 'OUT_OF_SERVICE', label: 'Out of Service'}, {value: 'DECOMMISSIONED', label: 'Decommissioned'}]} required />
                            <SelectField label="Condition" name="condition_rating" value={formData.condition_rating} onChange={handleInputChange} options={[{value: 'EXCELLENT', label: 'Excellent'}, {value: 'GOOD', label: 'Good'}, {value: 'FAIR', label: 'Fair'}, {value: 'POOR', label: 'Poor'}]} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Purchase Price ($)" name="purchase_price" value={formData.purchase_price || ''} onChange={handleInputChange} type="number" />
                            <InputField label="Current Value ($)" name="current_value" value={formData.current_value || ''} onChange={handleInputChange} type="number" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Purchase Date" name="purchase_date" value={formData.purchase_date || ''} onChange={handleInputChange} type="date" />
                            <InputField label="Warranty Expiry" name="warranty_expiry_date" value={formData.warranty_expiry_date || ''} onChange={handleInputChange} type="date" />
                            <InputField label="Year Manufactured" name="year_manufactured" value={formData.year_manufactured || ''} onChange={handleInputChange} type="number" required />
                        </div>
                         <SelectField label="Funding Source" name="funding_id" value={formData.funding_id || ''} onChange={handleInputChange} options={FUNDING_SOURCES.map(f => ({ value: f.funding_id, label: f.funding_name }))} />
                    </div>
                </form>
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" form="add-equipment-form" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90">Save Equipment</button>
                </div>
            </div>
        </div>
    );
};

export default AddEquipmentModal;
