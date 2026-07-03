// src/components/auth/panel-toggle.tsx
'use client'

import { Hotel, ShieldCheck } from 'lucide-react'

type Props = {
    mode: 'guest' | 'staff'
    onChange: (mode: 'guest' | 'staff') => void
}

const tabs = [
    { key: 'guest', label: 'Guest', icon: Hotel },
    { key: 'staff', label: 'Staff Portal', icon: ShieldCheck },
] as const

export function PanelToggle({ mode, onChange }: Props) {
    return (
        <div className="flex bg-surface border border-border rounded-lg p-0.75 mb-9">
            {tabs.map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    className={`flex flex-1 items-center justify-center gap-2 py-2.5 rounded-md text-[11px] tracking-[0.12em] uppercase transition-all duration-200 font-sans
            ${mode === key
                            ? 'bg-teal text-cream font-medium shadow-sm'
                            : 'text-text-muted hover:text-text'
                        }`}
                >
                    <Icon size={13} />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    )
}