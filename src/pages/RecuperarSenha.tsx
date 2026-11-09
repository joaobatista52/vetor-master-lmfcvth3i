import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import { toast } from 'sonner'

/**
 * RECUPERAÇÃO DE SENHA — solicitação do link de redefinição.
 * Pública (sem auth). Chama pb.collection('users').requestPasswordReset(email).
 * Mensagem de sucesso GENÉRICA: nunca revela se o e-mail existe na base.
 */
export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Preencha o e-mail.')
      return
    }
    setSubmitting(true)
    try {
      await pb.collection('users').requestPasswordReset(email.trim())
      setSent(true)
    } catch (error: any) {
      if (error?.status === 429) {
        toast.error('Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.')
      } else if (error?.status === 0 || !error?.status) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        // Demais erros (e-mail malformado, e-mail inexistente, etc.) recebem a
        // MESMA mensagem genérica — não revelar se o e-mail está cadastrado.
        setSent(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] hex-watermark p-4 relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#666666] hover:text-[#0066CC] transition-colors py-1.5 px-2.5 rounded hover:bg-[#F5F5F5]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o login</span>
        </Link>
      </div>

      <Card className="w-full max-w-md bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] shadow-md">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center py-2">
            <Link to="/" aria-label="Voltar para a página inicial">
              <Logo variant="vertical" size="xl" showTagline />
            </Link>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-[#333333]">Recuperar Senha</CardTitle>
            <CardDescription className="text-xs text-[#808080] mt-1">
              Informe seu e-mail para receber o link de redefinição
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <MailCheck className="w-10 h-10 text-[#22B14C]" />
              </div>
              <p className="text-sm text-[#333333]" role="status">
                Se este e-mail estiver cadastrado, você receberá um link de redefinição em alguns
                minutos.
              </p>
              <Button
                asChild
                className="w-full bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-medium"
              >
                <Link to="/login">Voltar para o login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-medium"
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enviar link de redefinição
              </Button>
            </form>
          )}
          <div className="mt-6 pt-4 border-t border-[#E0E0E0] text-center text-[10px] text-[#808080]">
            C-Level as a Service & Mentorship as a Software • V7.2
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
