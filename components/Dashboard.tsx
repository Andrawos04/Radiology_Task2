
import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { Equipment, EquipmentFilter } from '../types';
import { EQUIPMENT_TYPES } from '../constants';
import Icon from './Icon';

const useAnimatedCounter = (endValue: number, duration = 1000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const stepTime = Math.abs(Math.floor(duration / endValue));
        if (endValue === 0) {
            setCount(0);
            return;
        }
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === endValue) {
                clearInterval(timer);
            }
        }, stepTime);
        return () => clearInterval(timer);
    }, [endValue, duration]);
    return count;
};

const SummaryCard: React.FC<{ title: string; value: number; icon: React.ComponentProps<typeof Icon>['name']; color: string }> = ({ title, value, icon, color }) => {
    const animatedValue = useAnimatedCounter(value);
    return (
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 transition-transform duration-300 hover:scale-105">
            <div className={`rounded-full p-3 ${color.replace('text-', 'bg-').replace('500', '100')}`}>
                <Icon name={icon} className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{animatedValue}</p>
            </div>
        </div>
    );
};

interface DashboardProps {
    allEquipment: Equipment[];
    onFilterChange: (filters: EquipmentFilter) => void;
    activeFilters: EquipmentFilter;
    onAddEquipment: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ allEquipment, onFilterChange, activeFilters, onAddEquipment }) => {
    const summaryData = useMemo(() => {
        const total = allEquipment.length;
        const active = allEquipment.filter(e => e.equipment_status === 'ACTIVE').length;
        const maintenance = allEquipment.filter(e => e.equipment_status === 'MAINTENANCE').length;
        const outOfService = allEquipment.filter(e => e.equipment_status === 'OUT_OF_SERVICE').length;
        const needsMaintenanceSoon = allEquipment.filter(e => {
            if (e.next_maintenance_date && e.equipment_status === 'ACTIVE') {
                const today = new Date();
                const dueDate = new Date(e.next_maintenance_date);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 30;
            }
            return false;
        }).length;
        return { total, active, maintenance, outOfService, needsMaintenanceSoon };
    }, [allEquipment]);

    const statusChartData = useMemo(() => [
        { name: 'Active', value: summaryData.active, color: '#22C55E', status: 'ACTIVE' },
        { name: 'Maintenance', value: summaryData.maintenance, color: '#F59E0B', status: 'MAINTENANCE' },
        { name: 'Out of Service', value: summaryData.outOfService, color: '#EF4444', status: 'OUT_OF_SERVICE' },
    ], [summaryData]);

    const assetValueByType = useMemo(() => {
        const dataByType: { [key: number]: { name: string; value: number } } = {};
        EQUIPMENT_TYPES.forEach(type => {
            dataByType[type.equipment_type_id] = { name: type.type_name, value: 0 };
        });

        allEquipment.forEach(eq => {
            if (dataByType[eq.equipment_type_id]) {
                 dataByType[eq.equipment_type_id].value += eq.current_value || 0;
            }
        });
        return Object.values(dataByType).filter(d => d.value > 0).sort((a,b) => b.value - a.value);
    }, [allEquipment]);

    const handlePieClick = (data: any) => {
        onFilterChange({ status: [data.status] });
    };
    
    const clearDashboardFilter = () => {
        onFilterChange({});
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Inventory Overview</h2>
                    <button onClick={onAddEquipment} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-opacity-90 transition-all duration-300">
                        <Icon name="plus" className="w-5 h-5" />
                        <span className="font-semibold text-sm">Add Equipment</span>
                    </button>
                 </div>
                 {activeFilters.status && (
                     <button 
                        onClick={clearDashboardFilter} 
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full hover:bg-red-200 transition">
                        Clear Status Filter
                     </button>
                 )}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Total Equipment" value={summaryData.total} icon="archive" color="text-brand-primary" />
                <SummaryCard title="Active" value={summaryData.active} icon="check-circle" color="text-status-active" />
                <SummaryCard title="Under Maintenance" value={summaryData.maintenance} icon="wrench" color="text-status-maintenance" />
                <SummaryCard title="Out of Service" value={summaryData.outOfService} icon="x-circle" color="text-status-oos" />
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-800">Equipment Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontWeight="bold">{(percent * 100).toFixed(0)}%</text>);
                            }}
                            onClick={handlePieClick}
                            className="cursor-pointer"
                            >
                                {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.status === activeFilters?.status?.[0] ? 'black' : 'white'} strokeWidth={3} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-800">Asset Value by Equipment Type ($)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={assetValueByType} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" tickFormatter={(value) => `$${(Number(value) / 1000000).toFixed(1)}M`} />
                            <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12}}/>
                            <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))}/>
                            <Bar dataKey="value" fill="#00A9E0" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;