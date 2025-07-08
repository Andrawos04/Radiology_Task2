
import React, { useState, useMemo, useCallback } from 'react';
import { EQUIPMENT_DATA, MANUFACTURER_MAP, EQUIPMENT_TYPE_MAP } from './constants';
import type { Equipment, EquipmentFilter, ToastType, EquipmentFormData } from './types';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import Header from './components/Header';
import EquipmentDetailModal from './components/EquipmentDetailModal';
import AddEquipmentModal from './components/AddEquipmentModal';
import Toast from './components/Toast';
import { getFiltersFromQuery } from './services/geminiService';

const App: React.FC = () => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>(EQUIPMENT_DATA);
    const [aiFilters, setAiFilters] = useState<EquipmentFilter>({});
    const [dashboardFilters, setDashboardFilters] = useState<EquipmentFilter>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [toast, setToast] = useState<ToastType | null>(null);


    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setAiFilters({});
            return;
        }
        setIsLoading(true);
        setError(null);
        setDashboardFilters({}); // Clear dashboard filters on new search
        try {
            const newFilters = await getFiltersFromQuery(query);
            setAiFilters(newFilters);
        } catch (err) {
            setError('Failed to parse query. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleDashboardFilterChange = useCallback((newFilters: EquipmentFilter) => {
        setDashboardFilters(newFilters);
    }, []);

    const combinedFilters = useMemo(() => ({ ...aiFilters, ...dashboardFilters }), [aiFilters, dashboardFilters]);

    const filteredEquipment = useMemo(() => {
        return equipmentList.filter(item => {
            const { searchText, equipment_type, status, manufacturer, purchase_year_min, purchase_year_max, maintenance_due_in_days } = combinedFilters;

            if (searchText) {
                const searchLower = searchText.toLowerCase();
                const inName = item.equipment_name.toLowerCase().includes(searchLower);
                const inModel = item.model_number.toLowerCase().includes(searchLower);
                const inSerial = item.serial_number.toLowerCase().includes(searchLower);
                if (!inName && !inModel && !inSerial) return false;
            }
            if (equipment_type && equipment_type.length > 0) {
                 const itemType = EQUIPMENT_TYPE_MAP.get(item.equipment_type_id)?.type_code;
                 if (!itemType || !equipment_type.includes(itemType)) return false;
            }
            if (status && status.length > 0 && !status.includes(item.equipment_status)) return false;
            if (manufacturer && manufacturer.length > 0) {
                const itemManu = MANUFACTURER_MAP.get(item.manufacturer_id)?.manufacturer_name;
                if (!itemManu || !manufacturer.includes(itemManu)) return false;
            }
            if (purchase_year_min && item.purchase_date) {
                if (new Date(item.purchase_date).getFullYear() < purchase_year_min) return false;
            }
            if (purchase_year_max && item.purchase_date) {
                if (new Date(item.purchase_date).getFullYear() > purchase_year_max) return false;
            }
            if (maintenance_due_in_days && item.next_maintenance_date) {
                const today = new Date();
                const dueDate = new Date(item.next_maintenance_date);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 0 || diffDays > maintenance_due_in_days) return false;
            }
            return true;
        });
    }, [equipmentList, combinedFilters]);

    const handleViewDetails = (equipment: Equipment) => {
      setSelectedEquipment(equipment);
    };

    const handleCloseModal = () => {
      setSelectedEquipment(null);
    }
    
    const handleAddNewEquipment = (formData: EquipmentFormData) => {
        const newEquipment: Equipment = {
            ...formData,
            equipment_id: Date.now(), // Simple unique ID
            purchase_price: parseFloat(formData.purchase_price || '0'),
            current_value: parseFloat(formData.current_value || '0'),
            year_manufactured: parseInt(formData.year_manufactured || new Date().getFullYear().toString(), 10),
        };
        setEquipmentList(prev => [newEquipment, ...prev]);
        setIsAddModalOpen(false);
        setToast({ message: "Equipment added successfully!", type: 'success' });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <Header onSearch={handleSearch} isLoading={isLoading} />
            <main className="p-4 sm:p-6 lg:p-8">
                <Dashboard 
                    allEquipment={equipmentList} 
                    onFilterChange={handleDashboardFilterChange}
                    activeFilters={dashboardFilters}
                    onAddEquipment={() => setIsAddModalOpen(true)}
                />
                <div className="mt-8">
                    <EquipmentTable 
                      equipment={filteredEquipment} 
                      onViewDetails={handleViewDetails}
                      isLoading={isLoading}
                    />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </main>
            {selectedEquipment && (
              <EquipmentDetailModal
                equipment={selectedEquipment}
                onClose={handleCloseModal}
              />
            )}
            {isAddModalOpen && (
                <AddEquipmentModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddNewEquipment}
                    existingEquipment={equipmentList}
                />
            )}
        </div>
    );
};

export default App;
