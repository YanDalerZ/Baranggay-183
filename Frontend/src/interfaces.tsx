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