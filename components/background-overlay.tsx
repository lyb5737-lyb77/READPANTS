"use client";

export function BackgroundOverlay() {
    return (
        <>
            {/* Subtle pattern overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] -z-10"
                style={{
                    backgroundImage: `
                        repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(201, 42, 42, 0.05) 35px, rgba(201, 42, 42, 0.05) 70px),
                        repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(43, 138, 62, 0.03) 35px, rgba(43, 138, 62, 0.03) 70px)
                    `
                }}
            />
            {/* Animated accent gradient */}
            <div
                className="fixed -top-1/2 -right-1/2 w-full h-full pointer-events-none -z-10"
                style={{
                    background: 'radial-gradient(circle, rgba(201, 42, 42, 0.08) 0%, transparent 70%)',
                    animation: 'floatAnimation 20s ease-in-out infinite'
                }}
            />
        </>
    );
}
