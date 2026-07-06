'use client'

import { Hotel, ShieldCheck } from 'lucide-react'

export type AuthPanelMode = 'guest' | 'staff'

type Props = {
  mode: AuthPanelMode
  onChange: (mode: AuthPanelMode) => void
}

const tabs = [
  { key: 'guest' as const, label: 'Guest', icon: Hotel },
  { key: 'staff' as const, label: 'Staff Portal', icon: ShieldCheck },
]

export function PanelToggle({ mode, onChange }: Props) {
  return (
    <div className="flex rounded-lg p-0.75 mb-9
                    bg-[--surface] border border-[--border-color]">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`
            flex flex-1 items-center justify-center gap-2
            py-2.5 rounded-md
            text-[11px] tracking-[0.12em] uppercase font-sans
            transition-all duration-200
            ${mode === key
              ? 'bg-teal text-cream font-medium shadow-sm'
              : 'text-[--text-muted] hover:text-[--text-color]'
            }
          `}
        >
          <Icon size={13} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}