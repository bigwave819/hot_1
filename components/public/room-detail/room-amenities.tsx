import {
  Wifi, Coffee, Wind, Tv2,
  Sunset, Waves, Wine, Droplets, Check,
} from 'lucide-react'
import type { PublicRoom } from '@/actions/rooms'

const ALL_AMENITIES = [
  { key: 'hasWifi',       label: 'Free WiFi',        icon: Wifi,     desc: 'High-speed throughout'          },
  { key: 'hasBreakfast',  label: 'Breakfast',         icon: Coffee,   desc: 'Served 7:00 – 10:30 AM'        },
  { key: 'hasAC',         label: 'Air Conditioning',  icon: Wind,     desc: 'Climate-controlled'             },
  { key: 'hasTv',         label: 'Smart TV',          icon: Tv2,      desc: 'Streaming & satellite'          },
  { key: 'hasBalcony',    label: 'Private Balcony',   icon: Sunset,   desc: 'Panoramic hill view'            },
  { key: 'hasPoolAccess', label: 'Pool Access',        icon: Waves,    desc: 'Infinity pool & sun loungers'  },
  { key: 'hasMinibar',    label: 'Minibar',            icon: Wine,     desc: 'Stocked daily'                 },
  { key: 'hasHotWater',   label: 'Hot Water',          icon: Droplets, desc: '24-hour hot water'             },
] as const

interface Props { room: PublicRoom }

export function RoomAmenities({ room }: Props) {
  const active = ALL_AMENITIES.filter(
    a => room[a.key as keyof PublicRoom] === true
  )

  if (active.length === 0) return null

  return (
    <div>
      <h2 className="font-display text-[28px] font-light
                     text-[--text-color] mb-6">
        What's included
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {active.map(({ key, label, icon: Icon, desc }) => (
          <div
            key={key}
            className="flex items-start gap-4 rounded-xl
                       bg-[--surface] p-4 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center
                            justify-center rounded-full bg-teal/8">
              <Icon size={18} className="text-teal" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[--text-color]">
                  {label}
                </p>
                <Check size={13} className="text-gold shrink-0" />
              </div>
              <p className="text-[12px] text-[--muted] font-light mt-0.5">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}