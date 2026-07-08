'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2, Check } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

// ── Schema ────────────────────────────────────────────────────
const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
})

type ProfileValues = z.infer<typeof profileSchema>

// ── Component ─────────────────────────────────────────────────
interface Props {
    name: string
    email: string
}

export function ProfileForm({ name, email }: Props) {
    const router = useRouter()
    const [serverError, setServerError] = useState('')
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name },
    })

    async function onSubmit(values: ProfileValues) {
        setServerError('')
        setSuccess(false)

        const { error } = await authClient.updateUser({ name: values.name })

        if (error) {
            setServerError(error.message ?? 'Failed to update profile')
            return
        }

        setSuccess(true)
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email — read only */}
            <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase
                          font-medium mb-2 text-[--text-muted]">
                    Email Address
                </label>
                <div className="relative">
                    <Mail size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2
                           text-[--text-muted] pointer-events-none" />
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-md text-sm font-light
                       bg-[--bg] border border-[--border-color]/60
                       text-[--text-muted] cursor-not-allowed
                       focus:outline-none"
                    />
                </div>
                <p className="mt-1.5 text-[11px] text-[--text-muted]/60">
                    Email address cannot be changed.
                </p>
            </div>

            {/* Name */}
            <div>
                <label htmlFor="profile-name"
                    className="block text-[10px] tracking-[0.15em] uppercase
                          font-medium mb-2 text-[--text-muted]">
                    Display Name
                </label>
                <input
                    id="profile-name"
                    type="text"
                    autoComplete="name"
                    {...register('name')}
                    className={inputCls(!!errors.name)}
                />
                {errors.name?.message && (
                    <p className="mt-1.5 text-[11px] text-red-400">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Server error */}
            {serverError && (
                <div className="rounded-md bg-red-500/6 border border-red-500/15 px-4 py-3">
                    <p className="text-xs text-red-400">{serverError}</p>
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="flex items-center gap-2 rounded-md
                        bg-emerald-500/8 border border-emerald-500/15 px-4 py-3">
                    <Check size={13} className="text-emerald-500 shrink-0" />
                    <p className="text-xs text-emerald-500">Profile updated successfully.</p>
                </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-1">
                <button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="inline-flex items-center gap-2 rounded-md
                     bg-teal px-5 py-2.5
                     text-[11px] tracking-[0.15em] uppercase font-medium text-cream
                     hover:bg-teal-light transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting
                        ? <Loader2 size={13} className="animate-spin" />
                        : null
                    }
                    {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

        </form>
    )
}

const inputCls = (hasError: boolean) =>
    [
        'w-full px-4 py-3 rounded-md text-sm font-light',
        'bg-[--bg] border',
        'text-[--text-color] placeholder:text-[--border-2]',
        'focus:outline-none transition-colors duration-200',
        hasError
            ? 'border-red-400/60 focus:border-red-400'
            : 'border-[--border-color]/60 focus:border-teal',
    ].join(' ')