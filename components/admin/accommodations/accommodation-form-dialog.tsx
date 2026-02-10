"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accommodation, RoomType } from "@/types/accommodation";
import { createAccommodation, updateAccommodation, uploadAccommodationImage } from "@/lib/db/accommodations";
import { RoomTypeManager } from "./room-type-manager";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getRegions, Region } from "@/lib/db/regions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    country: z.string().min(2, "Country is required."),
    region: z.string().min(2, "Region is required."),
    description: z.string().optional(),
    address: z.string().optional(),
    contact: z.string().optional(),
});

interface AccommodationFormDialogProps {
    accommodation?: Accommodation; // If provided, edit mode
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AccommodationFormDialog({
    accommodation,
    trigger,
    open,
    onOpenChange,
    onSuccess,
}: AccommodationFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>(accommodation?.roomTypes || []);
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>(accommodation?.images || []);
    const [internalOpen, setInternalOpen] = useState(false);

    const isEditMode = !!accommodation;
    const finalOpen = open !== undefined ? open : internalOpen;
    const setFinalOpen = onOpenChange || setInternalOpen;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: accommodation?.name || "",
            country: accommodation?.country || "",
            region: accommodation?.region || "",
            description: accommodation?.description || "",
            address: accommodation?.address || "",
            contact: accommodation?.contact || "",
        },
    });

    const [regionsData, setRegionsData] = useState<Region[]>([]);
    const selectedCountry = watch("country");

    useEffect(() => {
        const fetchRegions = async () => {
            const data = await getRegions();
            setRegionsData(data);
        };
        fetchRegions();
    }, []);

    // Get unique countries
    const uniqueCountries = Array.from(new Set(regionsData.map(r => r.country)));

    // Filter regions based on selected country
    const filteredRegions = regionsData.filter(r => r.country === selectedCountry);

    useEffect(() => {
        if (accommodation) {
            reset({
                name: accommodation.name,
                country: accommodation.country,
                region: accommodation.region,
                description: accommodation.description,
                address: accommodation.address,
                contact: accommodation.contact,
            });
            setRoomTypes(accommodation.roomTypes || []);
            setImageUrls(accommodation.images || []);
        } else {
            reset({
                name: "",
                country: "",
                region: "",
                description: "",
                address: "",
                contact: "",
            });
            setRoomTypes([]);
            setImageUrls([]);
        }
    }, [accommodation, reset, finalOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            // Upload new images if any
            let uploadedUrls: string[] = [];
            if (images.length > 0) {
                uploadedUrls = await Promise.all(images.map(uploadAccommodationImage));
            }

            const finalImages = [...imageUrls, ...uploadedUrls];

            const accommodationData = {
                ...values,
                description: values.description || "",
                address: values.address || "",
                contact: values.contact || "",
                images: finalImages,
                roomTypes: roomTypes,
                cancellationPolicy: "",
                amenities: [],
            };

            if (isEditMode && accommodation) {
                await updateAccommodation(accommodation.id, accommodationData);
                toast.success("Accommodation updated successfully");
            } else {
                await createAccommodation(accommodationData);
                toast.success("Accommodation created successfully");
            }

            setFinalOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to save accommodation:", error);
            toast.error("Failed to save accommodation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={finalOpen} onOpenChange={setFinalOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "숙소 수정" : "숙소 등록"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">숙소 이름</Label>
                            <Input id="name" placeholder="호텔 이름" {...register("name")} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">국가</Label>
                            <Select
                                onValueChange={(value) => {
                                    setValue("country", value);
                                    setValue("region", ""); // Reset region when country changes
                                }}
                                defaultValue={accommodation?.country}
                                value={watch("country")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="국가 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueCountries.map((country) => (
                                        <SelectItem key={country} value={country}>
                                            {country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="region">지역</Label>
                            <Select
                                onValueChange={(value) => setValue("region", value)}
                                defaultValue={accommodation?.region}
                                value={watch("region")}
                                disabled={!selectedCountry}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="지역 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredRegions.map((region) => (
                                        <SelectItem key={region.id} value={region.region}>
                                            {region.region}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.region && <p className="text-sm text-red-500">{errors.region.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">연락처</Label>
                            <Input id="contact" placeholder="전화번호 또는 이메일" {...register("contact")} />
                            {errors.contact && <p className="text-sm text-red-500">{errors.contact.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">주소</Label>
                        <Input id="address" placeholder="상세 주소" {...register("address")} />
                        {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">설명</Label>
                        <Textarea id="description" placeholder="숙소 설명" className="min-h-[100px]" {...register("description")} />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>이미지</Label>
                        <Input type="file" multiple onChange={handleImageChange} accept="image/*" />
                        {imageUrls.length > 0 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto p-2 bg-gray-50 rounded">
                                {imageUrls.map((url, index) => (
                                    <div key={index} className="relative shrink-0">
                                        <img src={url} alt={`Preview ${index}`} className="h-20 w-20 object-cover rounded" />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== index))}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4">
                        <RoomTypeManager roomTypes={roomTypes} onChange={setRoomTypes} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setFinalOpen(false)}>
                            취소
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "수정 저장" : "등록하기"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
