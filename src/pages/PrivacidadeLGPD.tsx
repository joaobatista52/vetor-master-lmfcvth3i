import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Mail, Lock, FileCheck, Server, ArrowRight, ArrowLeft } from 'lucide-react'

export default function PrivacidadeLGPD() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] selection:bg-[#0066CC] selection:text-white">
      {/* 1. NAVBAR OFICIAL */}
      <header className="sticky top-0 z-50 border-b border-[#24334F] bg-[#111A2E]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 focus:outline-none">
            <Logo variant="horizontal" size="sm" showTagline />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#C7D0E0] hover:text-[#5B9DFF] hover:bg-[#16213A] text-xs font-medium rounded-[4px]"
            >
              <Link to="/" className="flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Início</span>
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white text-xs font-semibold rounded-[4px] shadow-sm transition-all duration-200"
            >
              <Link to="/questionario" className="flex items-center gap-1.5">
                <span>Começar Diagnóstico Gratuito</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* 2. BLOCO DE TOPO / HERO */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 border-b border-[#24334F]">
        <div className="absolute inset-0 hex-watermark opacity-60 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3DDC74]" />
            <span>CONFORMIDADE E TRANSPARÊNCIA</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] font-heading">
            Política de Privacidade e LGPD
          </h1>

          <p className="text-base sm:text-lg text-[#5B9DFF] font-medium max-w-2xl mx-auto">
            Como protegemos suas informações e garantimos a confidencialidade do seu diagnóstico
            estratégico.
          </p>

          <p className="text-sm sm:text-base text-[#C7D0E0] max-w-3xl mx-auto leading-relaxed text-justify sm:text-center">
            Na VETOR MASTER, tratamos a privacidade e a segurança dos dados da sua empresa com o
            mesmo rigor determinístico aplicado às nossas decisões executivas. Esta política
            descreve com total transparência como coletamos, tratamos, protegemos e armazenamos as
            suas informações, em integral conformidade com a Lei Geral de Proteção de Dados (Lei nº
            13.709/2018 — LGPD).
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <Badge className="bg-[#16213A] text-[#C7D0E0] border-[#24334F] py-1 px-3">
              Última atualização: Outubro de 2026
            </Badge>
            <Badge className="bg-[#16213A] text-[#3DDC74] border-[#24334F] py-1 px-3">
              Lei Geral de Proteção de Dados (Lei 13.709/2018)
            </Badge>
            <Badge className="bg-[#16213A] text-[#5B9DFF] border-[#24334F] py-1 px-3">
              Canal do Encarregado Ativo
            </Badge>
            <Badge className="bg-[#16213A] text-[#FFB84D] border-[#24334F] py-1 px-3">
              Criptografia Ponta a Ponta
            </Badge>
          </div>
        </div>
      </section>

      {/* 3. AS 7 SEÇÕES NUMERADAS */}
      <main className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* SEÇÃO 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-[4px] bg-[#0066CC] text-white border border-[#5B9DFF]">
                1.
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                  Controlador dos Dados
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-heading">
                  Quem somos e canal do encarregado (DPO)
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              O controlador dos dados pessoais e corporativos tratados nesta plataforma é a{' '}
              <strong className="text-[#F8FAFC]">VETOR MASTER</strong>, plataforma pioneira de
              Inteligência Executiva Determinística e diagnósticos de gestão para empresas
              brasileiras.
            </p>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              Para qualquer solicitação, dúvida, esclarecimento ou exercício dos seus direitos como
              titular de dados previstos na legislação, disponibilizamos canal direto com nosso
              Encarregado pelo Tratamento de Dados Pessoais (DPO):
            </p>

            <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px]">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[4px] bg-[#0066CC]/20 text-[#5B9DFF] flex items-center justify-center border border-[#0066CC]/40">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#8B98B4]">Canal Oficial do Encarregado (DPO)</div>
                    <a
                      href="mailto:privacidade@vetormaster.com.br"
                      className="text-sm sm:text-base font-semibold text-[#5B9DFF] hover:underline"
                    >
                      privacidade@vetormaster.com.br
                    </a>
                  </div>
                </div>

                <Button
                  size="sm"
                  asChild
                  className="bg-[#0066CC] hover:bg-[#22B14C] text-white text-xs font-semibold rounded-[4px]"
                >
                  <a href="mailto:privacidade@vetormaster.com.br">Enviar mensagem</a>
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* SEÇÃO 2 */}
          <section className="space-y-4 pt-6 border-t border-[#24334F]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-[4px] bg-[#0066CC] text-white border border-[#5B9DFF]">
                2.
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                  Coleta de Informações
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-heading">
                  Quais dados coletamos
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              Para viabilizar a elaboração de um diagnóstico com rigor executivo determinístico,
              coletamos exclusivamente as seguintes categorias de dados fornecidas pelo próprio
              usuário:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-[4px] bg-[#16213A] border border-[#24334F] space-y-1.5">
                <div className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5B9DFF]" />
                  Dados Cadastrais
                </div>
                <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                  Nome completo do respondente, nome/razão social da empresa, e-mail corporativo e
                  número de telefone/WhatsApp de contato.
                </p>
              </div>

              <div className="p-4 rounded-[4px] bg-[#16213A] border border-[#24334F] space-y-1.5">
                <div className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3DDC74]" />
                  Dados de Perfil da Operação
                </div>
                <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                  Setor econômico de atuação, faixa de faturamento anual estimado, número de
                  colaboradores e estrutura societária.
                </p>
              </div>

              <div className="p-4 rounded-[4px] bg-[#16213A] border border-[#24334F] space-y-1.5">
                <div className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFB84D]" />
                  Respostas do Questionário Estratégico
                </div>
                <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                  Informações sobre gargalos operacionais, práticas financeiras, canais de vendas,
                  rotinas de governança e alavancas de crescimento.
                </p>
              </div>

              <div className="p-4 rounded-[4px] bg-[#16213A] border border-[#24334F] space-y-1.5">
                <div className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5B9DFF]" />
                  Documentos Enviados (Anexos Opcionais)
                </div>
                <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                  Demonstrativos financeiros, relatórios gerenciais, certificações e documentos
                  societários (como contrato social) anexados voluntariamente para refino do
                  diagnóstico.
                </p>
              </div>
            </div>
          </section>

          {/* SEÇÃO 3 */}
          <section className="space-y-4 pt-6 border-t border-[#24334F]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-[4px] bg-[#0066CC] text-white border border-[#5B9DFF]">
                3.
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                  Finalidade e Base Legal
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-heading">
                  Para que utilizamos seus dados e bases legais
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              Os dados coletados são utilizados{' '}
              <strong className="text-[#F8FAFC]">exclusivamente</strong> para os seguintes fins:
            </p>

            <ul className="space-y-2.5 text-sm sm:text-base text-[#C7D0E0]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#3DDC74] font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-[#F8FAFC]">Elaboração do Diagnóstico Estratégico:</strong>{' '}
                  parametrização das respostas pelo motor determinístico VETOR MASTER e geração do
                  dossiê executivo em até 72 horas.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#3DDC74] font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-[#F8FAFC]">Condução da Devolutiva Executiva:</strong>{' '}
                  agendamento e realização da sessão de 45 minutos com um executivo sênior para
                  entrega prática das recomendações.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#3DDC74] font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-[#F8FAFC]">Comunicação sobre a solicitação:</strong> envio
                  de confirmação de recebimento, status do diagnóstico e links de acesso restrito ao
                  dossiê.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#3DDC74] font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-[#F8FAFC]">Contato comercial posterior:</strong>{' '}
                  exclusivamente quando expressamente autorizado pelo titular ao preencher o
                  formulário ou selecionar planos de serviço.
                </div>
              </li>
            </ul>

            <div className="p-4 rounded-[4px] bg-[#16213A] border-l-4 border-[#0066CC] border-y border-r border-[#24334F] space-y-1.5 mt-4">
              <div className="text-sm font-semibold text-[#F8FAFC]">
                Bases Legais da LGPD (Art. 7º, incisos I e V)
              </div>
              <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                O tratamento fundamenta-se na{' '}
                <strong className="text-[#F8FAFC]">execução de contrato</strong> e procedimentos
                preliminares relacionados ao serviço solicitado pelo usuário, bem como no{' '}
                <strong className="text-[#F8FAFC]">consentimento</strong> fornecido no momento do
                envio das informações.
              </p>
            </div>
          </section>

          {/* SEÇÃO 4 */}
          <section className="space-y-4 pt-6 border-t border-[#24334F]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-[4px] bg-[#0066CC] text-white border border-[#5B9DFF]">
                4.
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                  Compartilhamento Restrito
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-heading">
                  Quem tem acesso às suas informações
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              O acesso aos seus dados cadastrais, respostas estratégicas e anexos é estritamente
              restrito:
            </p>

            <ul className="space-y-2.5 text-sm sm:text-base text-[#C7D0E0]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#3DDC74] font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-[#F8FAFC]">Equipe VETOR MASTER autorizada:</strong> apenas
                  os especialistas e executivos C-level diretamente envolvidos no atendimento, na
                  análise do questionário e na condução da sua devolutiva.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#3DDC74] font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-[#F8FAFC]">Não comercialização:</strong> não vendemos, não
                  alugamos, não cedemos e não compartilhamos quaisquer dados com terceiros para fins
                  de marketing, publicidade ou prospecção.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#3DDC74] font-bold mt-0.5">•</span>
                <div>
                  <strong className="text-[#F8FAFC]">Infraestrutura segura:</strong> os dados
                  trafegam exclusivamente por provedores de computação em nuvem homologados que
                  atendem a padrões internacionais de segurança e contratos rigorosos de
                  confidencialidade.
                </div>
              </li>
            </ul>
          </section>

          {/* SEÇÃO 5 */}
          <section className="space-y-4 pt-6 border-t border-[#24334F]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-[4px] bg-[#0066CC] text-white border border-[#5B9DFF]">
                5.
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                  Retenção e Descarte
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-heading">
                  Período de retenção e exclusão
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              Os dados são armazenados pelo período estritamente necessário para o cumprimento do
              atendimento contratado e para o atendimento aos prazos estabelecidos pela legislação
              brasileira aplicável.
            </p>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              A qualquer momento, o titular tem o direito de solicitar a{' '}
              <strong className="text-[#F8FAFC]">exclusão definitiva</strong> ou a anonimização dos
              seus dados pessoais e dos arquivos enviados, bastando encaminhar uma solicitação ao
              canal oficial do encarregado (
              <a
                href="mailto:privacidade@vetormaster.com.br"
                className="text-[#5B9DFF] hover:underline"
              >
                privacidade@vetormaster.com.br
              </a>
              ), ressalvadas as hipóteses legais de guarda obrigatória.
            </p>
          </section>

          {/* SEÇÃO 6 */}
          <section className="space-y-4 pt-6 border-t border-[#24334F]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-[4px] bg-[#0066CC] text-white border border-[#5B9DFF]">
                6.
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                  Padrões Técnicos
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-heading">
                  Segurança da informação e salvaguardas
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              Adotamos medidas técnicas e organizacionais proporcionais e atualizadas para proteger
              suas informações contra acessos não autorizados, vazamento, alteração ou perda:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-[4px] bg-[#16213A] border border-[#24334F] space-y-2">
                <div className="w-8 h-8 rounded-[4px] bg-[#0066CC]/20 text-[#5B9DFF] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-[#F8FAFC]">Criptografia</div>
                <p className="text-xs text-[#C7D0E0] leading-relaxed">
                  Armazenamento criptografado e transmissão via protocolo seguro HTTPS/TLS.
                </p>
              </div>

              <div className="p-4 rounded-[4px] bg-[#16213A] border border-[#24334F] space-y-2">
                <div className="w-8 h-8 rounded-[4px] bg-[#3DDC74]/20 text-[#3DDC74] flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-[#F8FAFC]">Controle de Acesso</div>
                <p className="text-xs text-[#C7D0E0] leading-relaxed">
                  Acesso restrito por autenticação individualizada e política de menor privilégio.
                </p>
              </div>

              <div className="p-4 rounded-[4px] bg-[#16213A] border border-[#24334F] space-y-2">
                <div className="w-8 h-8 rounded-[4px] bg-[#FFB84D]/20 text-[#FFB84D] flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-[#F8FAFC]">Conformidade</div>
                <p className="text-xs text-[#C7D0E0] leading-relaxed">
                  Alinhamento com as melhores práticas de governança e padrões de segurança da
                  informação.
                </p>
              </div>
            </div>
          </section>

          {/* SEÇÃO 7 */}
          <section className="space-y-4 pt-6 border-t border-[#24334F]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-[4px] bg-[#0066CC] text-white border border-[#5B9DFF]">
                7.
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                  Direitos do Titular
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-heading">
                  Seus direitos como titular (LGPD, Art. 18)
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              Nos termos do artigo 18 da Lei Geral de Proteção de Dados, você pode solicitar a
              qualquer momento:
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-[4px] bg-[#16213A] border border-[#24334F] text-xs sm:text-sm text-[#C7D0E0] flex items-start gap-3">
                <span className="font-mono font-bold text-[#5B9DFF]">I.</span>
                <div>
                  <strong className="text-[#F8FAFC]">Confirmação e Acesso:</strong> saber se
                  tratamos seus dados e solicitar uma cópia integral.
                </div>
              </div>

              <div className="p-3.5 rounded-[4px] bg-[#16213A] border border-[#24334F] text-xs sm:text-sm text-[#C7D0E0] flex items-start gap-3">
                <span className="font-mono font-bold text-[#5B9DFF]">II.</span>
                <div>
                  <strong className="text-[#F8FAFC]">Correção:</strong> atualização de dados
                  incompletos, inexatos ou desatualizados.
                </div>
              </div>

              <div className="p-3.5 rounded-[4px] bg-[#16213A] border border-[#24334F] text-xs sm:text-sm text-[#C7D0E0] flex items-start gap-3">
                <span className="font-mono font-bold text-[#5B9DFF]">III.</span>
                <div>
                  <strong className="text-[#F8FAFC]">Portabilidade:</strong> recebimento dos seus
                  dados em formato estruturado e interoperável.
                </div>
              </div>

              <div className="p-3.5 rounded-[4px] bg-[#16213A] border border-[#24334F] text-xs sm:text-sm text-[#C7D0E0] flex items-start gap-3">
                <span className="font-mono font-bold text-[#5B9DFF]">IV.</span>
                <div>
                  <strong className="text-[#F8FAFC]">Exclusão e Anonimização:</strong> eliminação
                  dos dados tratados com base no seu consentimento.
                </div>
              </div>

              <div className="p-3.5 rounded-[4px] bg-[#16213A] border border-[#24334F] text-xs sm:text-sm text-[#C7D0E0] flex items-start gap-3">
                <span className="font-mono font-bold text-[#5B9DFF]">V.</span>
                <div>
                  <strong className="text-[#F8FAFC]">Revogação do Consentimento:</strong> revogação
                  a qualquer tempo, sem afetar a legalidade do tratamento prévio.
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#8B98B4] pt-2">
              Todos esses direitos são exercíveis de forma gratuita e facilitada mediante contato
              direto pelo canal do encarregado:{' '}
              <a
                href="mailto:privacidade@vetormaster.com.br"
                className="text-[#5B9DFF] hover:underline font-medium"
              >
                privacidade@vetormaster.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* 4. CTA FINAL */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-[#111A2E] to-[#0B1120] text-center relative overflow-hidden border-t border-[#24334F]">
        <div className="absolute inset-0 hex-watermark opacity-40 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30 text-xs uppercase tracking-wider font-semibold">
            Confidencialidade Absoluta
          </Badge>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
            Pronto para iniciar seu Diagnóstico Estratégico com total segurança?
          </h3>
          <p className="text-sm sm:text-base text-[#C7D0E0] max-w-2xl mx-auto leading-relaxed">
            Selecione o setor da sua empresa e responda ao Questionário Estratégico. Seus dados
            serão tratados com confidencialidade absoluta.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto bg-[#0066CC] hover:bg-[#22B14C] text-white font-semibold rounded-[4px] px-8 py-6 shadow-xl shadow-[#0066CC]/20"
            >
              <Link to="/questionario" className="flex items-center justify-center gap-2">
                <span>Comece seu diagnóstico agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              variant="outline"
              className="w-full sm:w-auto border-[#24334F] text-[#C7D0E0] hover:text-[#F8FAFC] hover:bg-[#16213A] rounded-[4px] px-6 py-6"
            >
              <Link to="/" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar à Página Inicial</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. RODAPÉ FINAL IDÊNTICO */}
      <footer className="border-t border-[#24334F] py-10 bg-[#0B1120] text-[#8B98B4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo variant="horizontal" size="sm" showTagline />
            <p className="text-xs text-[#8B98B4] mt-1">
              Expertise Executiva. Velocidade Tecnológica. Preço Acessível.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <Link to="/questionario" className="text-[#C7D0E0] hover:text-[#5B9DFF]">
              Diagnóstico Gratuito
            </Link>
            <Link to="/#setores" className="text-[#C7D0E0] hover:text-[#5B9DFF]">
              12 Setores
            </Link>
            <Link to="/#niveis" className="text-[#C7D0E0] hover:text-[#5B9DFF]">
              Escada de Valor
            </Link>
            <Link to="/privacidade" className="text-[#5B9DFF] font-medium">
              Privacidade e LGPD
            </Link>
            <Link to="/login" className="text-[#C7D0E0] hover:text-[#5B9DFF]">
              Área do Assinante
            </Link>
          </div>
          <div className="text-xs text-center md:text-right">
            <div>© 2026 VETOR MASTER. Todos os direitos reservados.</div>
            <div className="font-mono text-[10px] text-[#3DDC74] mt-0.5">
              JBP Gestão Master V7.2 • Alinhamento V1.3
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
