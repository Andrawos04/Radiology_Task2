
import React, { useState, useEffect, useRef } from 'react';
import type { Equipment } from '../types';
import { MANUFACTURER_MAP, EQUIPMENT_TYPE_MAP, ROOM_MAP, DEPARTMENT_MAP, BUILDING_MAP } from '../constants';
import Icon from './Icon';
import QRCode from 'qrcode';

interface EquipmentDetailModalProps {
  equipment: Equipment;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="py-2 grid grid-cols-3 gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 col-span-2">{value || 'N/A'}</dd>
  </div>
);

type Tab = 'Details' | 'Location' | 'Maintenance' | 'Financial';

const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({ equipment, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Details');
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  
  const manufacturer = MANUFACTURER_MAP.get(equipment.manufacturer_id);
  const type = EQUIPMENT_TYPE_MAP.get(equipment.equipment_type_id);
  const room = ROOM_MAP.get(equipment.room_id);
  const department = room ? DEPARTMENT_MAP.get(room.department_id) : undefined;
  const building = department ? BUILDING_MAP.get(department.building_id) : undefined;

  useEffect(() => {
    const humanReadableString = `
Equipment Name: ${equipment.equipment_name}
Inventory ID: ${equipment.inventory_code}
Type: ${type?.type_name || 'N/A'}
Manufacturer: ${manufacturer?.manufacturer_name || 'N/A'}
Model: ${equipment.model_number}
Serial #: ${equipment.serial_number}
Location: ${building?.building_name || ''} - ${department?.dept_name || ''} - ${room?.room_name || ''}
Status: ${equipment.equipment_status}
    `.trim();

    if (qrCodeRef.current) {
        QRCode.toCanvas(qrCodeRef.current, humanReadableString, { width: 220, margin: 2 }, (error) => {
            if (error) console.error('QR Code Generation Error:', error)
        })
    }
  }, [equipment, type, manufacturer, room, department, building]);


  const renderTabContent = () => {
    switch(activeTab) {
        case 'Details': return (
            <dl>
                <DetailItem label="Type" value={type?.type_name} />
                <DetailItem label="Manufacturer" value={manufacturer?.manufacturer_name} />
                <DetailItem label="Model" value={equipment.model_number} />
                <DetailItem label="Year Manufactured" value={equipment.year_manufactured} />
                <DetailItem label="Status" value={equipment.equipment_status} />
                <DetailItem label="Condition" value={equipment.condition_rating} />
            </dl>
        );
        case 'Location': return (
            <dl>
                <DetailItem label="Building" value={building?.building_name} />
                <DetailItem label="Department" value={department?.dept_name} />
                <DetailItem label="Room" value={room?.room_name} />
                <DetailItem label="Floor" value={room?.floor_number} />
            </dl>
        );
        case 'Maintenance': return (
            <dl>
                <DetailItem label="Last Maintenance" value={equipment.last_maintenance_date ? new Date(equipment.last_maintenance_date).toLocaleDateString() : 'N/A'} />
                <DetailItem label="Next Maintenance" value={equipment.next_maintenance_date ? new Date(equipment.next_maintenance_date).toLocaleDateString() : 'N/A'} />
                <DetailItem label="Frequency" value={equipment.maintenance_frequency_days ? `${equipment.maintenance_frequency_days} days` : 'N/A'} />
            </dl>
        );
        case 'Financial': return (
            <dl>
                <DetailItem label="Purchase Price" value={equipment.purchase_price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                <DetailItem label="Current Value" value={equipment.current_value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                <DetailItem label="Ownership" value={equipment.ownership_type} />
                <DetailItem label="Warranty Expiry" value={equipment.warranty_expiry_date ? new Date(equipment.warranty_expiry_date).toLocaleDateString() : 'N/A'} />
            </dl>
        );
        default: return null;
    }
  };

  const TabButton: React.FC<{tabName: Tab}> = ({ tabName }) => (
    <button 
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {tabName}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-20 flex items-center justify-center" onClick={onClose}>
      <div className="relative p-6 border w-full max-w-4xl shadow-2xl rounded-xl bg-white" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <Icon name="close" className="w-6 h-6" />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900">{equipment.equipment_name}</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">{equipment.inventory_code}</p>
                <canvas ref={qrCodeRef}></canvas>
                <p className="text-xs text-gray-500 mt-4">Scan for quick details</p>
                <div className="mt-4 w-full text-left">
                     <DetailItem label="Serial #" value={equipment.serial_number} />
                     <DetailItem label="Manufacturer" value={manufacturer?.manufacturer_name} />
                </div>
            </div>
            <div className="md:col-span-2">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton tabName='Details' />
                        <TabButton tabName='Location' />
                        <TabButton tabName='Maintenance' />
                        <TabButton tabName='Financial' />
                    </nav>
                </div>
                <div className="mt-4">
                    {renderTabContent()}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailModal;
