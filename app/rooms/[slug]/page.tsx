import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Users, BedDouble, Maximize2, MapPin,
    Wifi, Coffee, Wind, Tv2, Sunset, Waves, Wine, Droplets,
} from 'lucide-react'
import { getPublicRoomBySlug } from '@/actions/rooms'
import { RoomPhotoGallery } from '@/components/public/room-photo-gallery'

const AMENITIES = [
    { key: 'hasWifi', label: 'WiFi', icon: Wifi },
    { key: 'hasBreakfast', label: 'Breakfast', icon: Coffee },
    { key: 'hasAC', label: 'Air Conditioning', icon: Wind },
    { key: 'hasTv', label: 'TV', icon: Tv2 },
    { key: 'hasBalcony', label: 'Balcony', icon: Sunset },
    { key: 'hasPoolAccess', label: 'Pool Access', icon: Waves },
    { key: 'hasMinibar', label: 'Minibar', icon: Wine },
    { key: 'hasHotWater', label: 'Hot Water', icon: Droplets },
] as const

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const room = await getPublicRoomBySlug(slug)
    if (!room) return { title: 'Room' }
    return {
        title: room.name,
        description: room.description.slice(0, 155),
    }
}

export default async function RoomDetailPage({ params }: Props) {
    const { slug } = await params
    const room = await getPublicRoomBySlug(slug)
    if (!room) notFound()

    const activeAmenities = AMENITIES.filter(
        ({ key }) => room[key as keyof typeof room] === true
    )

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Link
                href="/rooms"
                className="mb-6 inline-flex items-center gap-2 text-sm
                  text-[--text-muted] hover:text-[--text-color] transition-colors"
            >
                <ArrowLeft size={14} />
                Back to Rooms
            </Link>

            <RoomPhotoGallery photos={room.photos} roomName={room.name} />

            <div className="mt-8 grid gap-8 lg:grid-cols-3">

                {/* Main content */}
                <div className="space-y-6 lg:col-span-2">
                    <div>
                        {room.view && (
                            <p className="mb-1.5 flex items-center gap-1.5 text-[11px]
                            uppercase tracking-[0.15em] text-gold">
                                <MapPin size={12} />
                                {room.view}
                            </p>
                        )}
                        <h1 className="font-display text-[32px] font-light leading-none
                          text-[--text-color] sm:text-[40px]">
                            {room.name}
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 border-y
                          border-[--border-color] py-4">
                        <Spec icon={Users} value={`${room.maxGuests} guests`} />
                        <Spec icon={BedDouble} value={`${room.bedrooms} bedroom${room.bedrooms > 1 ? 's' : ''}`} />
                        {room.beds && <Spec icon={BedDouble} value={room.beds} />}
                        {room.sizeM2 && <Spec icon={Maximize2} value={`${room.sizeM2}m²`} />}
                    </div>

                    <div>
                        <h2 className="mb-2 text-[11px] font-medium uppercase
                          tracking-[0.2em] text-[--text-muted]">
                            About This Room
                        </h2>
                        <p className="text-sm font-light leading-relaxed text-[--text-color]">
                            {room.description}
                        </p>
                    </div>

                    {activeAmenities.length > 0 && (
                        <div>
                            <h2 className="mb-3 text-[11px] font-medium uppercase
                            tracking-[0.2em] text-[--text-muted]">
                                Amenities
                            </h2>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {activeAmenities.map(({ key, label, icon: Icon }) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2 rounded-lg border
                              border-[--border-color] bg-[--surface] px-3 py-2.5"
                                    >
                                        <Icon size={14} className="shrink-0 text-teal" />
                                        <span className="text-[12px] text-[--text-color]">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Booking sidebar */}
                <div className="lg:sticky lg:top-6 lg:self-start">
                    <div className="space-y-4 rounded-xl border border-[--border-color]
                          bg-[--surface] p-6">
                        <div>
                            <p className="font-display text-[28px] font-light leading-none
                            text-[--text-color]">
                                ${room.pricePerNight}
                                <span className="font-sans text-[13px] font-light text-[--text-muted]">
                                    {' '}/ night
                                </span>
                            </p>
                            {room.weekendPrice && (
                                <p className="mt-1 text-[12px] text-[--text-muted]">
                                    ${room.weekendPrice} / night on weekends
                                </p>
                            )}
                        </div>

                        {/* NOTE: adjust this href to match your actual booking flow route */}
                        <Link
                            href={`/book/${room.slug}`}
                            className="flex w-full items-center justify-center rounded-md
                        bg-teal px-5 py-3.5 text-[11px] font-medium uppercase
                        tracking-[0.2em] text-cream hover:bg-teal-light
                        transition-colors"
                        >
                            Request to Book
                        </Link>

                        <p className="text-center text-[11px] text-[--text-muted]">
                            No payment required to request — we&apos;ll confirm availability with you.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Spec({ icon: Icon, value }: { icon: typeof Users; value: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Icon size={14} className="text-[--text-muted]" />
            <span className="text-[13px] text-[--text-color]">{value}</span>
        </div>
    )
}