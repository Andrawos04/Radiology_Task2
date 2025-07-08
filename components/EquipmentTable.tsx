
import React, { useState, useMemo } from 'react';
import type { Equipment, SortConfig } from '../types';
import { MANUFACTURER_MAP, EQUIPMENT_TYPE_MAP, ROOM_MAP, DEPARTMENT_MAP } from '../constants';
import Icon from './Icon';

interface EquipmentTableProps {
    equipment: Equipment[];
    onViewDetails: (equipment: Equipment) => void;
    isLoading: boolean;
}

const SortableHeader: React.FC<{
    title: string;
    sortKey: SortConfig['key'];
    sortConfig: SortConfig | null;
    requestSort: (key: SortConfig['key']) => void;
}> = ({ title, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;

    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center">
                <span>{title}</span>
                {isSorted && (
                    <Icon name={direction === 'ascending' ? 'arrow-up' : 'arrow-down'} className="w-4 h-4 ml-1" />
                )}
            </div>
        </th>
    );
};

const EquipmentTable: React.FC<EquipmentTableProps> = ({ equipment, onViewDetails, isLoading }) => {
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const sortedEquipment = useMemo(() => {
        let sortableItems = [...equipment];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (sortConfig.key === 'manufacturer_name') {
                    aValue = MANUFACTURER_MAP.get(a.manufacturer_id)?.manufacturer_name || '';
                    bValue = MANUFACTURER_MAP.get(b.manufacturer_id)?.manufacturer_name || '';
                } else if (sortConfig.key === 'type_name') {
                    aValue = EQUIPMENT_TYPE_MAP.get(a.equipment_type_id)?.type_name || '';
                    bValue = EQUIPMENT_TYPE_MAP.get(b.equipment_type_id)?.type_name || '';
                } else if (sortConfig.key === 'dept_name') {
                    const aRoom = ROOM_MAP.get(a.room_id);
                    aValue = aRoom ? DEPARTMENT_MAP.get(aRoom.department_id)?.dept_name || '' : '';
                    const bRoom = ROOM_MAP.get(b.room_id);
                    bValue = bRoom ? DEPARTMENT_MAP.get(bRoom.department_id)?.dept_name || '' : '';
                } else {
                    aValue = a[sortConfig.key as keyof Equipment];
                    bValue = b[sortConfig.key as keyof Equipment];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [equipment, sortConfig]);

    const requestSort = (key: SortConfig['key']) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getStatusColor = (status: Equipment['equipment_status']) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
            case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800';
            case 'DECOMMISSIONED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-12">
                        <div className="flex justify-center items-center">
                            <Icon name="spinner" className="h-8 w-8 text-brand-primary" />
                            <span className="ml-2 text-lg">Analyzing Query...</span>
                        </div>
                    </td>
                </tr>
            );
        }

        if (sortedEquipment.length === 0) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                        No equipment found. Try a different search or clear filters.
                    </td>
                </tr>
            );
        }

        return sortedEquipment.map(item => {
            const manufacturer = MANUFACTURER_MAP.get(item.manufacturer_id);
            const type = EQUIPMENT_TYPE_MAP.get(item.equipment_type_id);
            const room = ROOM_MAP.get(item.room_id);
            const department = room ? DEPARTMENT_MAP.get(room.department_id) : undefined;

            return (
                <tr key={item.equipment_id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.inventory_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.equipment_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type?.type_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manufacturer?.manufacturer_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{department?.dept_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.equipment_status)}`}>
                            {item.equipment_status.replace('_', ' ')}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => onViewDetails(item)} className="text-brand-primary hover:text-brand-secondary">
                            Details
                        </button>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Equipment Inventory</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader title="Inventory Code" sortKey="inventory_code" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader title="Name" sortKey="equipment_name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader title="Type" sortKey="type_name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader title="Manufacturer" sortKey="manufacturer_name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader title="Department" sortKey="dept_name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader title="Status" sortKey="equipment_status" sortConfig={sortConfig} requestSort={requestSort} />
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Details</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {renderTableBody()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EquipmentTable;
