import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/guard'
import { ProfileForm } from '@/components/admin/settings/profile-form'
import { PasswordForm } from '@/components/admin/settings/password-form'
import { ShieldCheck, User } from 'lucide-react'

export const metadata: Metadata = { title: 'Settings' }

const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrator',
    staff: 'Staff',
    guest: 'Guest',
}

export default async function SettingsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const { name, email, role } = session.user as {
        name: string
        email: string
        role: string
    }

    const roleLabel = ROLE_LABELS[role] ?? role

    // Initials helper
    const parts = name.trim().split(' ')
    const userInitials = parts.length === 1
        ? parts[0][0].toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()

    return (
        <div className="max-w-2xl space-y-6">

            {/* ── Header ── */}
            <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
                    Management Portal
                </p>
                <h1 className="font-display text-[32px] font-light
                       text-[--text-color] leading-none">
                    Settings
                </h1>
                <p className="mt-1.5 text-sm text-[--text-muted] font-light">
                    Manage your account details and security.
                </p>
            </div>

            {/* ── Account overview ── */}
            <div className="flex items-center gap-4 rounded-xl
                      border border-[--border-color]/60
                      bg-[--surface] p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center
                        rounded-full bg-teal/10 text-teal text-lg font-medium">
                    {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-[--text-color]">
                        {name}
                    </p>
                    <p className="truncate text-sm text-[--text-muted] font-light">
                        {email}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full
                        bg-teal/10 px-3 py-1.5">
                    <ShieldCheck size={12} className="text-teal" />
                    <span className="text-[11px] font-medium text-teal tracking-wide">
                        {roleLabel}
                    </span>
                </div>
            </div>

            {/* ── Profile ── */}
            <SettingsSection icon={User} title="Profile">
                <ProfileForm name={name} email={email} />
            </SettingsSection>

            {/* ── Password ── */}
            <SettingsSection icon={ShieldCheck} title="Change Password">
                <PasswordForm />
            </SettingsSection>

        </div>
    )
}

// ── Section wrapper ───────────────────────────────────────────
function SettingsSection({
    icon: Icon,
    title,
    children,
}: {
    icon: typeof User
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="rounded-xl border border-[--border-color]/60
                    bg-[--surface] overflow-hidden">
            <div className="flex items-center gap-3
                      border-b border-[--border-color]/60 px-5 py-4">
                <Icon size={15} className="text-[--text-muted]" />
                <p className="text-[10px] tracking-[0.2em] uppercase
                      text-[--text-muted] font-medium">
                    {title}
                </p>
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}