// src/components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ArrowRight, Shield, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { PanelToggle } from './panel-toggle'

type Mode = 'guest' | 'staff'
type AuthMode = 'signin' | 'signup'

export function LoginForm() {
    const router = useRouter()

    const [mode, setMode] = useState<Mode>('guest')
    const [authMode, setAuthMode] = useState<AuthMode>('signin')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const isStaff = mode === 'staff'
    const isSignup = authMode === 'signup' && !isStaff

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            if (isSignup) {
                const res = await authClient.signUp.email({
                    name, email, password, callbackURL: '/bookings',
                })
                if (res.error) throw new Error(res.error.message)
                router.push('/bookings')
            } else {
                const res = await authClient.signIn.email({
                    email, password,
                    callbackURL: isStaff ? '/admin/dashboard' : '/bookings',
                })
                if (res.error) throw new Error(res.error.message)
                router.push(isStaff ? '/admin/dashboard' : '/bookings')
            }
        } catch (err) {
            setError((err as Error).message ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>

            <PanelToggle
                mode={mode}
                onChange={(m) => { setMode(m); setAuthMode('signin'); setError('') }}
            />

            {/* Heading */}
            <div className="mb-7">
                <h2 className="font-display text-[30px] font-normal text-text tracking-tight mb-1.5">
                    {isStaff ? 'Staff portal' : isSignup ? 'Create account' : 'Welcome back'}
                </h2>
                <p className="text-sm font-light text-text-muted leading-relaxed">
                    {isStaff
                        ? 'Authorized personnel only'
                        : isSignup
                            ? 'Join Peponi to manage your stay'
                            : 'Sign in to manage your reservation'}
                </p>
            </div>

            {/* Gold divider */}
            <div className="flex items-center gap-3 mb-7">
                <div className="flex-1 h-px bg-border" />
                <div className="w-1.25 h-1.25 bg-gold rotate-45 shrink-0" />
                <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex flex-col gap-4">

                {/* Name */}
                {isSignup && (
                    <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Jean Paul Habimana"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-md text-text text-sm font-light placeholder:text-border-2 focus:outline-none focus:border-teal transition-colors duration-200"
                            />
                        </div>
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={isStaff ? 'staff@peponi.rw' : 'your@email.com'}
                            required
                            className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-md text-text text-sm font-light placeholder:text-border-2 focus:outline-none focus:border-teal transition-colors duration-200"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <label className="text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium">
                            Password
                        </label>
                        {!isSignup && (
                            <a href="/forgot-password" className="text-[11px] text-gold hover:text-gold-light transition-colors">
                                Forgot?
                            </a>
                        )}
                    </div>
                    <div className="relative">
                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-md text-text text-sm font-light placeholder:text-border-2 focus:outline-none focus:border-teal transition-colors duration-200"
                        />
                    </div>
                </div>

                {/* Staff note */}
                {isStaff && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-surface border border-border border-l-2 border-l-teal rounded-sm">
                        <Shield size={14} className="text-teal mt-0.5 shrink-0" />
                        <p className="text-xs text-text-muted font-light leading-relaxed">
                            Authorized Peponi staff only. Contact your manager to request access credentials.
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <p className="text-xs text-red-400 text-center bg-red-400/5 border border-red-400/20 rounded-md py-2.5 px-3">
                        {error}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-4 mt-1 bg-teal hover:bg-teal-light text-cream text-[11px] tracking-[0.2em] uppercase font-medium rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                    {loading
                        ? <Loader2 size={14} className="animate-spin" />
                        : <>
                            <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                            <ArrowRight size={14} />
                        </>
                    }
                </button>
            </div>

            {/* Switch mode */}
            {!isStaff && (
                <p className="text-center mt-6 text-sm text-text-muted">
                    {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        type="button"
                        onClick={() => { setAuthMode(isSignup ? 'signin' : 'signup'); setError('') }}
                        className="text-gold hover:text-gold-light transition-colors bg-transparent border-none cursor-pointer font-sans text-sm"
                    >
                        {isSignup ? 'Sign in' : 'Create account'}
                    </button>
                </p>
            )}

            <div className="mt-10 pt-5 border-t border-border text-center">
                <p className="text-[11px] tracking-wide text-border-2">
                    © 2024 Peponi Living Spaces · All rights reserved
                </p>
            </div>
        </form>
    )
}