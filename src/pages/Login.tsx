import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background relative">
      {/* Decorative corner marks — like alignment marks on a press */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-iron/20" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-iron/20" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-iron/20" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-iron/20" />

      <div className="w-full max-w-xs space-y-10">
        {/* Brand block */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {/* Iron plate icon */}
            <div className="w-10 h-10 rounded-sm bg-iron/10 border border-iron/30 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-iron">
                <rect x="3" y="2" width="14" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" />
                <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-5xl text-foreground leading-none tracking-widest">
                Rep Sheet
              </h1>
            </div>
          </div>

          {/* Score mark */}
          <div className="h-px bg-iron/40 w-16" />

          <p className="font-mono text-[11px] text-muted-foreground tracking-wider uppercase">
            {isSignUp ? 'Create account' : 'Track. Lift. Log.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-11 bg-card border-border font-sans text-sm placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="h-11 bg-card border-border font-sans text-sm placeholder:text-muted-foreground/50"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 py-2 px-3 bg-destructive/10 border border-destructive/20 rounded-sm">
              <span className="font-mono text-xs text-destructive">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-iron hover:bg-iron/90 text-iron-foreground font-display text-xl tracking-[0.15em] uppercase rounded-sm transition-colors"
          >
            {loading ? (
              <span className="font-mono text-sm tracking-wider">Loading...</span>
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Log In'
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
            className="font-mono text-[11px] text-muted-foreground hover:text-iron tracking-wider uppercase transition-colors"
          >
            {isSignUp
              ? 'Have an account? Log in'
              : 'New here? Sign up'}
          </button>
        </div>
      </div>

      {/* Version stamp */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <span className="font-mono text-[9px] text-muted-foreground/40 tracking-widest uppercase">
          V1.0
        </span>
      </div>
    </div>
  )
}
