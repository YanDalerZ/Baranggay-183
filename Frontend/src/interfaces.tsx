export const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://baranggay-183.onrender.com';
export default API_BASE_URL;

export interface SlideData {
    id: number;
    category: string;
    title: string;
    description: string;
    image: string;
    cta: string;
}

export interface ServiceData {
    id: number;
    label: string;
    title: string;
    description: string;
    image: string;
}

export interface EventData {
    id: number;
    day: string;
    month: string;
    year: string;
    title: string;
    time: string;
    location: string;
    featured?: boolean;
}



export type UserType = 'Both' | 'SC' | 'PWD' | '';
export interface EmergencyContact {
    id?: number;
    user_id?: number;
    name: string;
    relationship: string;
    contact: string;
}

export interface User {
    id?: number;
    system_id?: string;
    firstname: string;
    lastname: string;
    status?: 'active' | 'inactive';
    gender: string;
    birthday: string;
    contact_number: string;
    email: string;
    address: string;
    type: UserType;
    id_expiry_date: string;
    disability: string;
    is_flood_prone: boolean;
    emergency_id?: number;
    emergencyContact: EmergencyContact;
    created_at?: string;
    updated_at?: string;
}


export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    total: number;
    allocated: number;
    unit: string;
}

export interface DistributionRecord {
    date_claimed: string;
    resident: string;
    resident_id: string;
    system_id: string;
    resident_type: 'SC' | 'PWD';
    item_description: string;
    status: 'Claimed' | 'To Claim';
    date: string;
    batch_id: string;
    batch_name?: string;
}

export interface Batch {
    id: string;
    batch_name: string;
    target_group: 'SC' | 'PWD' | 'BOTH';
    created_at: string;
    total_eligible: number;
    items_summary: string;
}

export interface BatchData {
    batchName: string;
    targetGroup: 'SC' | 'PWD' | 'BOTH';
    selectedItems: {
        id: string;
        name: string;
        qty: number;
    }[];
}
export interface Event {
    id: string;
    title: string;
    type: 'Health Mission' | 'Community Event' | 'Relief Distribution' | 'Vaccination' | 'Birthday';
    event_date: string;
    event_time: string;
    location: string;
    attendees: string;
    description: string;
}

export interface Notification {
    id: number;
    sender_id: string;
    target_group: 'all' | 'pwd' | 'sc' | 'flood_prone';
    title: string;
    message: string;
    recipient_count: number;
    created_at: string | Date;
}


export interface NotificationRead {
    notification_id: number;
    user_id: string;
    read_at: string | Date;
}


export interface NotificationHistoryItem {
    id: number;
    title: string;
    desc: string;
    recipients: number;
    date: string;
    target_group: string[];
    channels?: string[];
    message: string;
}

export interface NotificationStats {
    sentToday: number;
    totalRecipients: number;
    deliveryRate: string;
}