export interface RoomType {
    id: string; // Unique within the accommodation (can be UUID or index based)
    name: string; // e.g., "Standard", "Deluxe", "Suite"
    description: string;
    priceSingle: number; // Price for 1 person (in local currency e.g. KRW unless specified)
    priceDouble: number; // Price for 2 people
    currency: string; // "KRW" | "USD" | "THB" | "VND"
}

export interface Accommodation {
    id: string;
    name: string;
    country: string;
    region: string;
    description: string;
    images: string[];
    address: string;
    contact: string;
    roomTypes: RoomType[];
    cancellationPolicy: string;
    amenities: string[];
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}
