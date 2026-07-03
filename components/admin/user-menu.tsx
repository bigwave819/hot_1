'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter }                   from 'next/navigation'
import { Settings, LogOut, ChevronDown, UserCircle } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export function UserMenu() {
  const router             = useRouter()
  const [open, setOpen]    = useState(false)
  const ref                = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <div className="relative" ref={ref}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5
                   border border-[--border-color]
                   bg-[--surface]
                   hover:bg-[--surface-2]
                   transition-colors duration-150"
        aria-label="User menu"
        aria-expanded={open}
      >
        {/* Avatar */}
        <div className="flex h-7 w-7 items-center justify-center
                        rounded-full bg-teal text-cream text-xs font-medium shrink-0">
          A
        </div>

        {/* Name — hidden on small screens */}
        <div className="hidden sm:block text-left">
          <p className="text-[13px] font-medium text-[--text-color] leading-none mb-0.5">
            Admin User
          </p>
          <p className="text-[10px] text-[--text-muted] leading-none uppercase tracking-wide">
            Owner
          </p>
        </div>

        <ChevronDown
          size={14}
          className={`text-[--text-muted] transition-transform duration-200
                      ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-50 z-50
                     rounded-lg border border-[--border-color]
                     bg-[--bg] shadow-xl
                     overflow-hidden
                     animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User info header */}
          <div className="border-b border-[--border-color] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center
                              rounded-full bg-teal text-cream text-xs font-medium">
                A
              </div>
              <div>
                <p className="text-[13px] font-medium text-[--text-color]">
                  Admin User
                </p>
                <p className="text-[11px] text-[--text-muted]">
                  admin@peponi.rw
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <MenuItem
              icon={UserCircle}
              label="Profile"
              onClick={() => { router.push('/admin/settings'); setOpen(false) }}
            />
            <MenuItem
              icon={Settings}
              label="Settings"
              onClick={() => { router.push('/admin/settings'); setOpen(false) }}
            />
          </div>

          {/* Logout */}
          <div className="border-t border-[--border-color] py-1">
            <MenuItem
              icon={LogOut}
              label="Sign out"
              onClick={handleLogout}
              danger
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reusable menu item ────────────────────────────────────────
function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon:    typeof Settings
  label:   string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center gap-3 px-4 py-2.5
        text-sm font-light transition-colors duration-100 text-left
        ${danger
          ? 'text-red-400 hover:bg-red-500/8'
          : 'text-[--text-color] hover:bg-[--surface]'
        }
      `}
    >
      <Icon size={15} className={danger ? 'text-red-400' : 'text-[--text-muted]'} />
      {label}
    </button>
  )
}