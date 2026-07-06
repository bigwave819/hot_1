'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail, Lock, User, ArrowRight,
  Loader2, Eye, EyeOff,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'

// ── Schemas ───────────────────────────────────────────────────
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignInValues = z.infer<typeof signInSchema>
type SignUpValues = z.infer<typeof signUpSchema>
type Tab = 'signin' | 'signup'

const STAFF_ROLES = ['admin', 'staff']

// ── Tab toggle ────────────────────────────────────────────────
const TABS: { key: Tab; label: string }[] = [
  { key: 'signin', label: 'Sign In' },
  { key: 'signup', label: 'Create Account' },
]

// ── Component ─────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('signin')
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isSignup = tab === 'signup'

  // ── Sign In form ──────────────────────────────────────────
  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  // ── Sign Up form ──────────────────────────────────────────
  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  // Only the active form's submitting state should drive the button —
  // otherwise a stale submit on the hidden form could show a spinner
  // on the wrong tab.
  const loading = isSignup
    ? signUpForm.formState.isSubmitting
    : signInForm.formState.isSubmitting

  // Switch tabs — reset both forms and server error
  function handleTabChange(t: Tab) {
    setTab(t)
    setServerError('')
    signInForm.reset()
    signUpForm.reset()
  }

  // ── Sign In submit ────────────────────────────────────────
  // Works for both guests and staff — same form, same endpoint.
  // The DB-stored role decides where they land afterward.
  async function onSignIn(values: SignInValues) {
    setServerError('')
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (error) throw new Error(error.message ?? 'Sign in failed')

      const role = (data?.user as any)?.role ?? 'guest'
      router.push(STAFF_ROLES.includes(role) ? '/admin' : '/dashboard/bookings')
      router.refresh()
    } catch (err) {
      setServerError((err as Error).message ?? 'Something went wrong')
    }
  }

  // ── Sign Up submit ────────────────────────────────────────
  async function onSignUp(values: SignUpValues) {
    setServerError('')
    try {
      const { data, error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      if (error) throw new Error(error.message ?? 'Signup failed')

      // New accounts default to 'guest' at the DB level (schema.ts:
      // role.default("guest")). Staff access is granted later by an
      // admin, not through this form — so we can route straight to
      // the guest dashboard without checking role here.
      const role = (data?.user as any)?.role ?? 'guest'
      router.push(STAFF_ROLES.includes(role) ? '/admin' : '/dashboard/bookings')
      router.refresh()
    } catch (err) {
      setServerError((err as Error).message ?? 'Something went wrong')
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="w-full">

      {/* ── Tab toggle ── */}
      <div className="flex rounded-lg p-0.75 mb-9
                      bg-[--surface] border border-[--border-color]">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabChange(key)}
            className={`
              flex-1 py-2.5 rounded-md
              text-[11px] tracking-[0.12em] uppercase font-sans
              transition-all duration-200
              ${tab === key
                ? 'bg-teal text-cream font-medium shadow-sm'
                : 'text-[--text-muted] hover:text-[--text-color]'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Heading ── */}
      <div className="mb-7">
        <h2 className="font-display text-[30px] font-normal tracking-tight mb-1.5
                       text-[--text-color]">
          {isSignup ? 'Create account' : 'Welcome back'}
        </h2>
        <p className="text-sm font-light leading-relaxed text-[--text-muted]">
          {isSignup
            ? 'Join Peponi to manage your stay'
            : 'Sign in to manage your reservation or access the staff portal'}
        </p>
      </div>

      {/* ── Gold divider ── */}
      <div className="flex items-center gap-3 mb-7">
        <div className="flex-1 h-px bg-[--border-color]" />
        <div className="w-1.25 h-1.25 bg-gold rotate-45 shrink-0" />
        <div className="flex-1 h-px bg-[--border-color]" />
      </div>

      {/* ── Sign In form ── */}
      {!isSignup && (
        <form onSubmit={signInForm.handleSubmit(onSignIn)} noValidate>
          <div className="flex flex-col gap-5">

            {/* Email */}
            <div>
              <label htmlFor="signin-email"
                className="block text-[10px] tracking-[0.2em] uppercase
                                font-medium mb-2 text-[--text-muted]">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2
                                 text-[--text-muted] pointer-events-none" />
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="your@email.com"
                  {...signInForm.register('email')}
                  className={inputCls(!!signInForm.formState.errors.email, 'pl-11')}
                />
              </div>
              <FieldError message={signInForm.formState.errors.email?.message} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label htmlFor="signin-password"
                  className="text-[10px] tracking-[0.2em] uppercase
                                  font-medium text-[--text-muted]">
                  Password
                </label>
                <a href="/forgot-password"
                  className="text-[11px] text-gold hover:text-gold-light transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2
                                 text-[--text-muted] pointer-events-none" />
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...signInForm.register('password')}
                  className={inputCls(!!signInForm.formState.errors.password, 'pl-11 pr-12')}
                />
                <PasswordToggle show={showPassword} onToggle={() => setShowPassword(p => !p)} />
              </div>
              <FieldError message={signInForm.formState.errors.password?.message} />
            </div>

            <ServerError message={serverError} />

            <SubmitButton loading={loading} label="Sign In" />
          </div>
        </form>
      )}

      {/* ── Sign Up form ── */}
      {isSignup && (
        <form onSubmit={signUpForm.handleSubmit(onSignUp)} noValidate>
          <div className="flex flex-col gap-5">

            {/* Name */}
            <div>
              <label htmlFor="signup-name"
                className="block text-[10px] tracking-[0.2em] uppercase
                                font-medium mb-2 text-[--text-muted]">
                Full Name
              </label>
              <div className="relative">
                <User size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2
                                 text-[--text-muted] pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  placeholder="Jean Paul Habimana"
                  {...signUpForm.register('name')}
                  className={inputCls(!!signUpForm.formState.errors.name, 'pl-11')}
                />
              </div>
              <FieldError message={signUpForm.formState.errors.name?.message} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email"
                className="block text-[10px] tracking-[0.2em] uppercase
                                font-medium mb-2 text-[--text-muted]">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2
                                 text-[--text-muted] pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  {...signUpForm.register('email')}
                  className={inputCls(!!signUpForm.formState.errors.email, 'pl-11')}
                />
              </div>
              <FieldError message={signUpForm.formState.errors.email?.message} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password"
                className="block text-[10px] tracking-[0.2em] uppercase
                                font-medium mb-2 text-[--text-muted]">
                Password
              </label>
              <div className="relative">
                <Lock size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2
                                 text-[--text-muted] pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...signUpForm.register('password')}
                  className={inputCls(!!signUpForm.formState.errors.password, 'pl-11 pr-12')}
                />
                <PasswordToggle show={showPassword} onToggle={() => setShowPassword(p => !p)} />
              </div>
              <FieldError message={signUpForm.formState.errors.password?.message} />
            </div>

            <ServerError message={serverError} />

            <SubmitButton loading={loading} label="Create Account" />
          </div>
        </form>
      )}

      {/* ── Footer ── */}
      <div className="mt-10 pt-5 border-t border-[--border-color] text-center">
        <p className="text-[11px] tracking-wide text-[--border-2]">
          © 2024 Peponi Living Spaces · All rights reserved
        </p>
      </div>
    </div>
  )
}

// ── Small reusable pieces ─────────────────────────────────────

function inputCls(hasError: boolean, extra = '') {
  return [
    'w-full px-4 py-3.5 rounded-md text-sm font-light',
    'bg-[--surface] border',
    'text-[--text-color] placeholder:text-[--border-2]',
    'focus:outline-none transition-colors duration-200',
    hasError
      ? 'border-red-400 focus:border-red-400'
      : 'border-[--border-color] focus:border-teal',
    extra,
  ].join(' ')
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-[11px] text-red-400">{message}</p>
}

function ServerError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="px-4 py-3 rounded-md bg-red-500/8 border border-red-500/20">
      <p className="text-xs text-red-400 text-center">{message}</p>
    </div>
  )
}

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="absolute right-4 top-1/2 -translate-y-1/2
                 text-[--text-muted] hover:text-[--text-color] transition-colors"
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5
                 py-4 mt-1 rounded-md bg-teal hover:bg-teal-light
                 text-cream text-[11px] tracking-[0.2em] uppercase font-medium
                 transition-all duration-150 active:scale-[0.99]
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? <Loader2 size={15} className="animate-spin" />
        : <><span>{label}</span><ArrowRight size={14} /></>
      }
    </button>
  )
}