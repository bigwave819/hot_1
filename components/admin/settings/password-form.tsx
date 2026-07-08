'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

// ── Schema ────────────────────────────────────────────────────
const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'Must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine(
        data => data.newPassword === data.confirmPassword,
        { message: "Passwords don't match", path: ['confirmPassword'] }
    )
    .refine(
        data => data.currentPassword !== data.newPassword,
        { message: 'New password must differ from current password', path: ['newPassword'] }
    )

type PasswordValues = z.infer<typeof passwordSchema>

// ── Component ─────────────────────────────────────────────────
export function PasswordForm() {
    const [serverError, setServerError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    async function onSubmit(values: PasswordValues) {
        setServerError('')
        setSuccess(false)

        const { error } = await authClient.changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            revokeOtherSessions: true,
        })

        if (error) {
            setServerError(error.message ?? 'Failed to change password')
            return
        }

        setSuccess(true)
        reset()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Current password */}
            <PasswordField
                id="current-password"
                label="Current Password"
                autoComplete="current-password"
                show={showCurrent}
                onToggle={() => setShowCurrent(p => !p)}
                error={errors.currentPassword?.message}
                registration={register('currentPassword')}
            />

            {/* New password */}
            <PasswordField
                id="new-password"
                label="New Password"
                autoComplete="new-password"
                show={showNew}
                onToggle={() => setShowNew(p => !p)}
                error={errors.newPassword?.message}
                registration={register('newPassword')}
            />

            {/* Confirm password */}
            <div>
                <label htmlFor="confirm-password"
                    className="block text-[10px] tracking-[0.15em] uppercase
                          font-medium mb-2 text-[--text-muted]">
                    Confirm New Password
                </label>
                <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={inputCls(!!errors.confirmPassword)}
                />
                {errors.confirmPassword?.message && (
                    <p className="mt-1.5 text-[11px] text-red-400">
                        {errors.confirmPassword.message}
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
                    <p className="text-xs text-emerald-500">
                        Password changed. All other sessions have been signed out.
                    </p>
                </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-1">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-md
                     bg-teal px-5 py-2.5
                     text-[11px] tracking-[0.15em] uppercase font-medium text-cream
                     hover:bg-teal-light transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Lock size={13} />
                    }
                    {isSubmitting ? 'Updating…' : 'Update Password'}
                </button>
            </div>

        </form>
    )
}

// ── Shared password field ─────────────────────────────────────
function PasswordField({
    id,
    label,
    autoComplete,
    show,
    onToggle,
    error,
    registration,
}: {
    id: string
    label: string
    autoComplete: string
    show: boolean
    onToggle: () => void
    error?: string
    registration: ReturnType<ReturnType<typeof useForm<PasswordValues>>['register']>
}) {
    return (
        <div>
            <label htmlFor={id}
                className="block text-[10px] tracking-[0.15em] uppercase
                        font-medium mb-2 text-[--text-muted]">
                {label}
            </label>
            <div className="relative">
                <Lock size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2
                         text-[--text-muted] pointer-events-none" />
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    autoComplete={autoComplete}
                    placeholder="••••••••"
                    {...registration}
                    className={inputCls(!!error, 'pl-10 pr-11')}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2
                     text-[--text-muted] hover:text-[--text-color]
                     transition-colors"
                    aria-label={show ? 'Hide' : 'Show'}
                >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>
            {error && (
                <p className="mt-1.5 text-[11px] text-red-400">{error}</p>
            )}
        </div>
    )
}

const inputCls = (hasError: boolean, extra = '') =>
    [
        'w-full px-4 py-3 rounded-md text-sm font-light',
        'bg-[--bg] border',
        'text-[--text-color] placeholder:text-[--border-2]',
        'focus:outline-none transition-colors duration-200',
        hasError
            ? 'border-red-400/60 focus:border-red-400'
            : 'border-[--border-color]/60 focus:border-teal',
        extra,
    ].join(' ')