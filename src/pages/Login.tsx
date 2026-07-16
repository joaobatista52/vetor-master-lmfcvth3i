import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, MailWarning } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [emailConflict, setEmailConflict] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const isEmailConflictError = (error: any): boolean => {
    if (error?.status === 409) return true
    const fieldErrs = extractFieldErrors(error)
    if (fieldErrs.email) {
      const msg = fieldErrs.email.toLowerCase()
      if (
        msg.includes('unique') ||
        msg.includes('already') ||
        msg.includes('exist') ||
        msg.includes('cadastr')
      ) {
        return true
      }
    }
    return false
  }

  const getAuthErrorMessage = (error: any): string => {
    if (error?.status === 0) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    }
    if (!isLogin && isEmailConflictError(error)) {
      return 'E-mail já cadastrado. Por favor, tente fazer o login.'
    }
    if (isLogin && (error?.status === 401 || error?.status === 400)) {
      return 'Credenciais inválidas. Verifique seu email e senha.'
    }
    return getErrorMessage(error) || (isLogin ? 'Erro ao entrar.' : 'Erro ao criar conta.')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setFieldErrors({})
    setEmailConflict(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Preencha email e senha.')
      return
    }
    setFieldErrors({})
    setEmailConflict(false)
    setLoading(true)
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password)
    setLoading(false)
    if (error) {
      setFieldErrors(extractFieldErrors(error))
      if (!isLogin && isEmailConflictError(error)) {
        setEmailConflict(true)
      }
      toast.error(getAuthErrorMessage(error))
      return
    }
    toast.success(isLogin ? 'Bem-vindo!' : 'Conta criada com sucesso!')
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo className="w-12 h-12" />
          </div>
          <div>
            <CardTitle className="text-2xl">Vetor Master</CardTitle>
            <CardDescription className="mt-1">
              {isLogin ? 'Entre na sua conta' : 'Crie a sua conta'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailConflict) setEmailConflict(false)
                }}
                required
              />
              {fieldErrors.email && !emailConflict && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
              {fieldErrors.passwordConfirm && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.passwordConfirm}
                </p>
              )}
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  A senha deve ter no mínimo 8 caracteres.
                </p>
              )}
            </div>
            {emailConflict && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 p-3 flex items-start gap-2">
                <MailWarning className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  E-mail já cadastrado. Por favor, tente fazer o login.{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-semibold underline hover:no-underline"
                  >
                    Ir para o login
                  </button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
          <div className="text-center mt-4 text-sm text-muted-foreground">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Criar conta' : 'Entrar'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
