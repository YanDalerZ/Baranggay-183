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