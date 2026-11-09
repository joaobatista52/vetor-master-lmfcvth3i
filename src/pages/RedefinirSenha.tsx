import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * REDEFINIR SENHA — Bloco 4.3 (E2-H v2)
 * Rota pública /redefinir-senha?token=...
 * Confirma o reset via confirmPasswordReset(token, novaSenha, confirmacao).
 */
export default function RedefinirSenha() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const mensagemErro = (error: any): string => {
    if (error?.status === 0) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    }
    if (error?.response?.data?.token || error?.status === 400) {
      return 'Token inválido ou expirado. Solicite um novo link de redefinição.'
    }
    const data = error?.response?.data
    if (data?.passwordConfirm) return 'As senhas não coincidem.'
    if (data?.password) return 'A senha deve ter no mínimo 8 caracteres.'
    return 'Não foi possível redefinir a senha. Tente novamente.'
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErro(null)
    if (!password.trim()) {
      toast.error('Preencha a nova senha.')
      return
    }
    if (password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (confirm !== password) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (!token) {
      setErro('Token de redefinição ausente no link. Solicite um novo link.')
      return
    }
    setSubmitting(true)
    try {
      await pb.collection('users').confirmPasswordReset(token, password, confirm)
      setSucesso(true)
      toast.success('Senha redefinida com sucesso!')
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (error: any) {
      setErro(mensagemErro(error))
      toast.error(mensagemErro(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] hex-watermark p-4 relative">
      <Card className="w-full max-w-md bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] shadow-md">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center py-2">
            <Logo variant="vertical" size="xl" showTagline />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-[#333333]">
              {sucesso ? 'Senha Redefinida' : 'Definir Nova Senha'}
            </CardTitle>
            <CardDescription className="text-xs text-[#808080] mt-1">
              {sucesso
                ? 'Sua senha foi alterada. Você já pode entrar na plataforma.'
                : 'Escolha uma nova senha de no mínimo 8 caracteres.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sucesso ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#22B14C]" />
              </div>
              <p className="text-sm text-[#333333]">
                Senha redefinida com sucesso! Redirecionando para o login...
              </p>
              <Button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-medium"
              >
                Ir para o Login
              </Button>
            </div>
          ) : !token ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
              <p className="text-sm text-[#333333]">
                Token de redefinição ausente ou inválido no link.
              </p>
              <Button
                type="button"
                onClick={() => navigate('/recuperar-senha', { replace: true })}
                className="w-full bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-medium"
              >
                Solicitar novo link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar nova senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A senha deve ter no mínimo 8 caracteres.
                </p>
              </div>
              {erro && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {erro}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-medium"
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Redefinir Senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
