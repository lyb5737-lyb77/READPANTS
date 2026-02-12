"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getAccommodations } from "@/lib/db/accommodations"; // Updated import
import { Accommodation } from "@/types/accommodation"; // Updated import
import { createQuote } from "@/lib/db/quotes";
import { useAuthStore } from "@/lib/store/auth-store";

const formSchema = z.object({
    // Travel Info
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),

    arrivalAirport: z.enum(["HAN", "HPH"]),
    pickupService: z.enum(["none", "pickup", "sending", "roundtrip"]),

    // People
    numberOfMen: z.coerce.number().min(0),
    numberOfWomen: z.coerce.number().min(0),

    // Accommodation
    accommodationType: z.string().min(1, "숙소를 선택해주세요."), // Changed to string
    roomType: z.string().optional(),

    // Golf
    golfRounds: z.coerce.number().min(0),

    // Payment
    // Payment
    paymentMethod: z.enum(["onsite", "online"]),

    // Content
    content: z.string().optional(),

    // User Info (if not logged in, but we assume restricted access or auto-fill)
    userPhone: z.string().min(1, "연락처를 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuoteRequestForm() {
    const router = useRouter();
    const { user, userProfile } = useAuthStore();
    const [step, setStep] = useState<'form' | 'review'>('form');
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [loadingAccommodations, setLoadingAccommodations] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            // Force cast or ensure values match type
            numberOfMen: 0,
            numberOfWomen: 0,
            golfRounds: 0,
            arrivalAirport: "HAN",
            pickupService: "none",
            accommodationType: "direct",
            paymentMethod: "onsite",
            content: "", // Optional string in Zod but required in defaultValues for controller
            userPhone: userProfile?.phone || "",
            // DateRange default is undefined initially
        },
    });

    const watchAccommodationType = form.watch("accommodationType");
    const watchDateRange = form.watch("dateRange");

    // Calculate nights & days
    const nights = watchDateRange?.from && watchDateRange?.to
        ? differenceInDays(watchDateRange.to, watchDateRange.from)
        : 0;
    const days = nights + 1;

    // Fetch accommodations on mount
    useEffect(() => {
        const fetchAccommodationsData = async () => {
            setLoadingAccommodations(true);
            try {
                const data = await getAccommodations();
                setAccommodations(data);
            } catch (error) {
                console.error("Failed to fetch accommodations:", error);
                toast.error("숙소 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoadingAccommodations(false);
            }
        };
        fetchAccommodationsData();
    }, []);

    function onReview(data: FormValues) {
        if (data.numberOfMen + data.numberOfWomen === 0) {
            form.setError("numberOfMen", { message: "최소 1명 이상의 인원을 입력해주세요." });
            return;
        }

        // Find selected accommodation
        const selectedAcc = accommodations.find(a => a.id === data.accommodationType);

        // Validation: If accommodation has room types, roomType must be selected
        if (selectedAcc && selectedAcc.roomTypes && selectedAcc.roomTypes.length > 0 && !data.roomType) {
            form.setError("roomType", { message: "객실 타입을 선택해주세요." });
            return;
        }

        setStep("review");
    }

    async function onFinalSubmit() {
        const data = form.getValues();
        setIsSubmitting(true);
        try {
            // Check login
            if (!user) {
                toast.error("로그인이 필요합니다.");
                router.push("/login");
                return;
            }

            // Get selected accommodation name for saving (optional, or just save ID)
            // But usually we want to display the name in admin. 
            // Currently DB stores 'accommodationType' string. We can store ID or Name.
            // Storing ID is safer for relations, but storing Name/ID combo or just ID is fine.
            // Existing logic uses "sunflower" or "direct".
            // Let's store the ID.

            const quoteData = {
                userId: user.uid,
                authorName: userProfile?.nickname || user.email?.split("@")[0] || "익명",
                userPhone: data.userPhone,

                country: "Vietnam",
                region: data.arrivalAirport === "HAN" ? "Hanoi" : "Haiphong", // Derive region from airport logic

                startDate: data.dateRange.from.toISOString(),
                endDate: data.dateRange.to.toISOString(),
                nights,
                days,

                arrivalAirport: data.arrivalAirport,
                pickupService: data.pickupService,

                numberOfMen: Number(data.numberOfMen),
                numberOfWomen: Number(data.numberOfWomen),
                totalPeople: Number(data.numberOfMen) + Number(data.numberOfWomen),

                accommodationType: data.accommodationType,
                roomType: data.roomType,

                golfRounds: data.golfRounds,

                paymentMethod: data.paymentMethod,
                content: data.content || "",

                // Fields not in form but required by type
                // Since we updated interface, we don't need to pass it.
            };

            await createQuote(quoteData as any); // Cast as any to avoid minor type mismatches during dev

            toast.success("견적 요청이 성공적으로 접수되었습니다.");
            router.push("/quotes");

        } catch (error) {
            console.error("Failed to submit quote:", error);
            toast.error("견적 요청 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const selectedAccommodation = accommodations.find(a => a.id === watchAccommodationType);

    if (step === 'review') {
        const values = form.getValues();

        // Find accommodation logic for display
        let accommodationDisplay = "직접 예약";
        let roomDisplay = "";
        let priceDisplay = "";

        if (values.accommodationType !== 'direct') {
            const acc = accommodations.find(a => a.id === values.accommodationType);
            if (acc) {
                accommodationDisplay = acc.name;
                if (values.roomType) {
                    const room = acc.roomTypes?.find(r => r.name === values.roomType); // Storing room name in value
                    if (room) {
                        roomDisplay = `(${room.name})`;
                        // Display base price if available, maybe logic for single/double?
                        // Just display one of them for now as estimate
                        priceDisplay = `${new Intl.NumberFormat('ko-KR').format(room.priceDouble || room.priceSingle || 0)} ${room.currency}/박`;
                    } else {
                        roomDisplay = `(${values.roomType})`;
                    }
                }
            } else {
                accommodationDisplay = "알 수 없는 숙소";
            }
        }

        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h3 className="text-lg font-bold border-b pb-2">견적 요청 내용 확인</h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block">여행 일정</span>
                            <span className="font-medium">
                                {format(values.dateRange.from, "yyyy.MM.dd")} ~ {format(values.dateRange.to, "yyyy.MM.dd")} ({nights}박 {days}일)
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">도착 공항</span>
                            <span className="font-medium">{values.arrivalAirport === 'HAN' ? '하노이 (노이바이)' : '하이퐁 (깟비)'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">인원</span>
                            <span className="font-medium">남 {values.numberOfMen}명, 여 {values.numberOfWomen}명 (총 {Number(values.numberOfMen) + Number(values.numberOfWomen)}명)</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">픽업/샌딩</span>
                            <span className="font-medium">
                                {values.pickupService === 'none' && '필요없음'}
                                {values.pickupService === 'pickup' && '픽업만'}
                                {values.pickupService === 'sending' && '샌딩만'}
                                {values.pickupService === 'roundtrip' && '왕복'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">숙소</span>
                            <span className="font-medium">
                                {accommodationDisplay} {roomDisplay}
                                {priceDisplay && <span className="text-xs text-gray-400 block">{priceDisplay}</span>}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">골프 라운딩</span>
                            <span className="font-medium">{values.golfRounds}회</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">결제 방식</span>
                            <span className="font-medium">
                                {values.paymentMethod === 'onsite' ? '체크인 시 결제' : '온라인 전액 결제'}
                            </span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-gray-500 block">추가 요청사항</span>
                            <span className="font-medium whitespace-pre-wrap">{values.content || "-"}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-gray-500 block">연락처</span>
                            <span className="font-medium">{values.userPhone}</span>
                        </div>
                    </div>

                    {values.paymentMethod === 'onsite' && (
                        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-4">
                            <h4 className="flex items-center text-sm font-bold text-yellow-800 mb-1">
                                <Info className="w-4 h-4 mr-2" />
                                안내사항
                            </h4>
                            <p className="text-sm text-yellow-700">
                                체크인 시 결제를 선택하셨더라도, <strong>노쇼 방지를 위해 총 견적 금액의 10%를 선입금</strong> 해주셔야 예약이 확정됩니다.
                                <br />견적 승인 후 입금 계좌를 안내해 드립니다.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setStep('form')} disabled={isSubmitting}>수정하기</Button>
                    <Button onClick={onFinalSubmit} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        견적 요청 등록
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onReview)} className="space-y-8">
                {/* 1. 여행 일정 및 공항 */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                        기본 일정 정보
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/50">
                        <FormField
                            control={form.control}
                            name="dateRange"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>여행 일정 ({nights}박 {days}일)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value?.from ? (
                                                        field.value.to ? (
                                                            <>
                                                                {format(field.value.from, "yyyy-MM-dd")} -{" "}
                                                                {format(field.value.to, "yyyy-MM-dd")}
                                                            </>
                                                        ) : (
                                                            format(field.value.from, "yyyy-MM-dd")
                                                        )
                                                    ) : (
                                                        <span>날짜 선택</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={field.value?.from}
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                numberOfMonths={2}
                                                locale={ko}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="arrivalAirport"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>도착 공항</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="공항 선택" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="HAN">하노이 (노이바이 국제공항)</SelectItem>
                                            <SelectItem value="HPH">하이퐁 (깟비 국제공항)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* 2. 인원 및 픽업 */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                        인원 및 이동
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/50">
                        <div className="space-y-4">
                            <FormLabel>인원 구성</FormLabel>
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="numberOfMen"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-xs text-gray-500">남성</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numberOfWomen"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-xs text-gray-500">여성</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <p className="text-sm text-right font-medium text-gray-700">
                                총 {Number(form.watch("numberOfMen") || 0) + Number(form.watch("numberOfWomen") || 0)}명
                            </p>
                        </div>
                        <FormField
                            control={form.control}
                            name="pickupService"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>픽업/샌딩 요청</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="none" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    필요없음
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="pickup" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    픽업만 요청 (공항 → 숙소)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="sending" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    샌딩만 요청 (숙소 → 공항)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="roundtrip" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    왕복 요청
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* 3. 숙소 및 골프 */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                        숙소 및 골프
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50/50">
                        <FormField
                            control={form.control}
                            name="accommodationType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>숙소 예약</FormLabel>
                                    <FormControl>
                                        {/* Dynamic Accommodations Logic */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Direct Option */}
                                            <label
                                                className={cn(
                                                    "flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                    field.value === "direct" && "border-red-600 bg-red-50"
                                                )}
                                                onClick={() => {
                                                    field.onChange("direct");
                                                    form.setValue("roomType", ""); // Clear room type
                                                }}
                                            >
                                                <span className="mb-2 text-2xl">🏨</span>
                                                <span className="font-semibold text-sm">직접 예약</span>
                                            </label>

                                            {/* Mapped Accommodations */}
                                            {loadingAccommodations ? (
                                                <div className="flex items-center justify-center p-4 border rounded-md">
                                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                    <span className="text-sm">로딩 중...</span>
                                                </div>
                                            ) : (
                                                accommodations.map((acc) => (
                                                    <label
                                                        key={acc.id}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                            field.value === acc.id && "border-red-600 bg-red-50"
                                                        )}
                                                        onClick={() => {
                                                            field.onChange(acc.id);
                                                            form.setValue("roomType", ""); // Clear room type on switch
                                                        }}
                                                    >
                                                        {acc.images && acc.images.length > 0 ? (
                                                            <img src={acc.images[0]} alt={acc.name} className="w-10 h-10 rounded-full object-cover mb-2" />
                                                        ) : (
                                                            <span className="mb-2 text-2xl">🏡</span>
                                                        )}
                                                        <span className="font-semibold text-sm line-clamp-1">{acc.name}</span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Detail View Button */}
                        {watchAccommodationType !== "direct" && selectedAccommodation && (
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/accommodations/${selectedAccommodation.id}`, '_blank')}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <Info className="w-4 h-4 mr-2" />
                                    {selectedAccommodation.name} 상세 정보 보기
                                </Button>
                            </div>
                        )}

                        {/* Room Type Select - Only show if not direct and accommodation has room types */}
                        {watchAccommodationType !== "direct" && selectedAccommodation && selectedAccommodation.roomTypes && selectedAccommodation.roomTypes.length > 0 && (
                            <FormField
                                control={form.control}
                                name="roomType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>객실 선택 ({selectedAccommodation.name})</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="객실 타입 선택" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {selectedAccommodation.roomTypes.map((room) => (
                                                    <SelectItem key={room.name} value={room.name}>
                                                        {room.name} ({new Intl.NumberFormat('ko-KR').format(room.priceDouble || room.priceSingle || 0)} {room.currency}/박)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="golfRounds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>골프 라운딩 횟수</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <Input type="number" min={0} {...field} className="w-24" />
                                        </FormControl>
                                        <span className="text-sm">회</span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* 4. 결제 및 기타 */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">4</span>
                        결제 및 기타 확인
                    </h3>
                    <div className="p-4 border rounded-lg bg-gray-50/50 space-y-6">
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>결제 방법</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0 bg-white p-3 rounded border">
                                                <FormControl>
                                                    <RadioGroupItem value="onsite" />
                                                </FormControl>
                                                <div className="flex flex-col">
                                                    <FormLabel className="font-bold">
                                                        체크인 시 결제
                                                    </FormLabel>
                                                    <span className="text-xs text-gray-500">현장에서 결제합니다. (노쇼 방지 예약금 발생)</span>
                                                </div>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0 bg-white p-3 rounded border">
                                                <FormControl>
                                                    <RadioGroupItem value="online" />
                                                </FormControl>
                                                <div className="flex flex-col">
                                                    <FormLabel className="font-bold">
                                                        온라인 전액 결제
                                                    </FormLabel>
                                                    <span className="text-xs text-gray-500">견적 확정 후 온라인으로 전액 결제합니다.</span>
                                                </div>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>추가 요청사항</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="특별히 요청하실 내용이 있다면 적어주세요."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="userPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>연락처</FormLabel>
                                    <FormControl>
                                        <Input placeholder="연락 받으실 전화번호를 입력해주세요." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" className="bg-red-600 hover:bg-red-700 w-full md:w-auto">
                        견적 요청 확인
                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
