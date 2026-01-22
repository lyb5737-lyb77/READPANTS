'use client';

import { useState, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Loader2, X, Image as ImageIcon, MapPin, Flag, Clock, Info } from 'lucide-react';
import { GolfCourse } from '@/types/golf-course';

const formSchema = z.object({
    name: z.string().min(1, "골프장 이름은 필수입니다."),
    enName: z.string().min(1, "영문 이름은 필수입니다."),
    holes: z.coerce.number().min(9, "최소 9홀 이상이어야 합니다."),
    yards: z.string().optional(),
    designer: z.string().optional(),

    teeOffWeekday: z.string().optional(),
    teeOffWeekend: z.string().optional(),
    facilities: z.string().optional(),

    caddyTip: z.string().optional(),
    cartInfo: z.string().optional(),
    galleryFee: z.string().optional(),
    galleryAvailable: z.boolean().default(true),

    description: z.string().optional(),
    address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
    params: Promise<{ id?: string }>;
}

export default function GolfCourseFormPage(props: PageProps) {
    const router = useRouter();
    const [params, setParams] = useState<{ id?: string } | null>(null);

    // Use useEffect to unwrap the Promise
    useEffect(() => {
        props.params.then(setParams);
    }, [props.params]);

    const id = params?.id;
    const isEditMode = !!id && id !== 'new';

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [initialLoading, setInitialLoading] = useState(isEditMode);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            galleryAvailable: true,
            holes: 18,
        }
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchCourse = async () => {
                try {
                    const docRef = doc(db, 'golf-courses', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data() as GolfCourse;
                        reset({
                            name: data.name,
                            enName: data.enName,
                            holes: data.holes,
                            yards: data.yards,
                            designer: data.designer,
                            teeOffWeekday: data.teeOffTime?.weekday,
                            teeOffWeekend: data.teeOffTime?.weekend,
                            facilities: data.facilities,
                            caddyTip: data.caddyTip,
                            cartInfo: data.cartInfo,
                            galleryFee: data.galleryInfo?.fee,
                            galleryAvailable: data.galleryInfo?.available,
                            description: data.description,
                            address: data.address,
                        });
                        setImages(data.images || []);
                    }
                } catch (error) {
                    console.error("Error fetching course:", error);
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchCourse();
        }
    }, [isEditMode, id, reset]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newImageUrls: string[] = [];

        try {
            for (const file of files) {
                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // sanitize filename
                const storageRef = ref(storage, `golf-courses/${timestamp}_${safeName}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                newImageUrls.push(url);
            }
            setImages(prev => [...prev, ...newImageUrls]);
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            const courseData: Partial<GolfCourse> = {
                name: data.name,
                enName: data.enName,
                holes: data.holes,
                yards: data.yards,
                designer: data.designer,
                teeOffTime: {
                    weekday: data.teeOffWeekday || '',
                    weekend: data.teeOffWeekend || ''
                },
                facilities: data.facilities,
                caddyTip: data.caddyTip,
                cartInfo: data.cartInfo,
                galleryInfo: {
                    available: data.galleryAvailable,
                    fee: data.galleryFee || ''
                },
                description: data.description,
                address: data.address,
                images: images,
                updatedAt: new Date()
            };

            if (isEditMode && id) {
                await updateDoc(doc(db, 'golf-courses', id), courseData);
            } else {
                courseData.createdAt = new Date();
                await addDoc(collection(db, 'golf-courses'), courseData);
            }

            router.push('/admin/resources');
            router.refresh();
        } catch (error) {
            console.error("Error saving course:", error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    // Render content only if params are loaded (for new page params might be empty, handled by isEditMode check)
    if (!params && isEditMode) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">
                    {isEditMode ? '골프장 정보 수정' : '새 골프장 등록'}
                </h2>
                <Button variant="ghost" onClick={() => router.back()}>취소</Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* 기본 정보 섹션 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Flag className="w-5 h-5 text-primary" /> 기본 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">골프장 이름 (한글) <span className="text-red-500">*</span></Label>
                            <Input id="name" placeholder="예: 그린우드 골프 클럽" {...register("name")} />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="enName">영문 이름 <span className="text-red-500">*</span></Label>
                            <Input id="enName" placeholder="예: Greenwood Golf Club" {...register("enName")} />
                            {errors.enName && <p className="text-xs text-red-500">{errors.enName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="holes">홀 수</Label>
                            <Input id="holes" type="number" {...register("holes")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="yards">전장 (Yards)</Label>
                            <Input id="yards" placeholder="예: 7000 야드" {...register("yards")} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="designer">설계자</Label>
                            <Input id="designer" placeholder="예: Peter Thompson" {...register("designer")} />
                        </div>
                    </CardContent>
                </Card>

                {/* 운영 정보 섹션 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" /> 운영 및 시설
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="teeOffWeekday">티오프 시간 (주중)</Label>
                            <Input id="teeOffWeekday" placeholder="예: 06:00 ~ 14:00" {...register("teeOffWeekday")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="teeOffWeekend">티오프 시간 (주말)</Label>
                            <Input id="teeOffWeekend" placeholder="예: 06:00 ~ 14:00" {...register("teeOffWeekend")} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="facilities">부대 시설</Label>
                            <Input id="facilities" placeholder="예: 수영장, 레스토랑, 드라이빙 레인지" {...register("facilities")} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">주소 / 위치 설명</Label>
                            <div className="flex gap-2">
                                <MapPin className="w-10 h-10 text-gray-400 p-2 bg-gray-100 rounded" />
                                <Input id="address" placeholder="주소를 입력하세요" {...register("address")} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 요금 및 규정 섹션 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" /> 요금 및 규정
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="caddyTip">캐디팁 규정</Label>
                            <Input id="caddyTip" placeholder="예: 300바트 (권장)" {...register("caddyTip")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cartInfo">카트 규정</Label>
                            <Input id="cartInfo" placeholder="예: 1인 1카트 필수, 페어웨이 진입 가능" {...register("cartInfo")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="galleryFee">갤러리 비용</Label>
                            <Input id="galleryFee" placeholder="예: 1000바트 (카트 포함)" {...register("galleryFee")} />
                        </div>
                        <div className="space-y-2">
                            <Label className="block mb-2">갤러리 입장 가능 여부</Label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 border p-3 rounded cursor-pointer hover:bg-gray-50">
                                    <input type="radio" value="true" {...register("galleryAvailable")} /> 가능
                                </label>
                                <label className="flex items-center gap-2 border p-3 rounded cursor-pointer hover:bg-gray-50">
                                    <input type="radio" value="false" {...register("galleryAvailable")} /> 불가능
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">기타 주의사항 / 설명</Label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                id="description"
                                placeholder="환불 규정이나 복장 규정 등 추가 설명을 입력하세요."
                                {...register("description")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 이미지 업로드 섹션 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-primary" /> 사진 등록
                        </CardTitle>
                        <CardDescription>
                            골프장 전경, 코스 사진 등을 등록해주세요. (다중 선택 가능)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {images.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt={`Uploaded ${index}`} className="object-cover w-full h-full" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                {uploading ? (
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500 font-medium">사진 추가</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 pb-10">
                    <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
                        취소
                    </Button>
                    <Button type="submit" size="lg" disabled={loading || uploading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditMode ? '수정 사항 저장' : '골프장 등록하기'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
