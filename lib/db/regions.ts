import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface Region {
    id: string;
    country: string;
    region: string;
    label: string;
    isActive: boolean;
}

export async function getRegions(): Promise<Region[]> {
    const querySnapshot = await getDocs(collection(db, "regions"));
    const regions: Region[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        regions.push({
            id: doc.id,
            country: data.country,
            region: data.region,
            label: data.label,
            isActive: data.isActive !== false,
        } as Region);
    });
    return regions;
}
