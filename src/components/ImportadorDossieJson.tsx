import React, { useState } from 'react'
import { Upload, FileCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface ImportadorProps {
  onDossieImportado?: (dossie: any) => void
}

/**
 * Importador de Dossiê .json do Site Institucional Vetor Master V7.2
 * Permite que um lead gerado no site institucional (v0.0.80) importe seu arquivo
 * e continue diretamente o fluxo de conversão ou análise no app SaaS.
 */
export function ImportadorDossieJson({ onDossieImportado }: ImportadorProps) {
  const { toast } = useToast()
  const [carregando, setCarregando] = useState(false)
  const [dadosCarregados, setDadosCarregados] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setErro(null)
    setCarregando(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string
        const json = JSON.parse(conteudo)

        // Validação da estrutura mínima do dossiê V7.2
        if (!json.empresa && !json.dados_entrada && !json.setor_id && !json.setor) {
          throw new Error(
            'Arquivo JSON não possui a estrutura oficial do Dossiê Vetor Master V7.2.',
          )
        }

        const dossieNormalizado = {
          empresa: json.empresa || json.dados_entrada?.empresa || {},
          setor_id: json.setor_id || json.dados_entrada?.setor_id || json.setor || 'saude',
          micro_epifanias: json.micro_epifanias || json.dados_entrada?.micro_epifanias || [],
          respostas_3_pilares:
            json.respostas_3_pilares || json.dados_entrada?.respostas_3_pilares || [],
          secao_1_perfil: json.secao_1_perfil || json.dados_entrada?.secao_1_perfil || [],
          secao_5_hackman: json.secao_5_hackman || json.dados_entrada?.secao_5_hackman || [],
          secao_6_buffett: json.secao_6_buffett || json.dados_entrada?.secao_6_buffett || [],
          secao_8_inovacao: json.secao_8_inovacao || json.dados_entrada?.secao_8_inovacao || [],
          secao_9_proximos_passos:
            json.secao_9_proximos_passos || json.dados_entrada?.secao_9_proximos_passos || [],
          questionario_version: json.questionario_version || '7.2-importado-site',
          data_importacao: new Date().toISOString(),
        }

        setDadosCarregados(dossieNormalizado)
        localStorage.setItem('vm_dossie_importado_site', JSON.stringify(dossieNormalizado))

        toast({
          title: 'Dossiê V7.2 Importado',
          description: `Empresa: ${dossieNormalizado.empresa['Razão Social'] || 'Identificada'} · Setor: ${dossieNormalizado.setor_id}`,
        })

        if (onDossieImportado) {
          onDossieImportado(dossieNormalizado)
        }
      } catch (err: any) {
        setErro(err.message || 'Falha ao processar o arquivo .json.')
      } finally {
        setCarregando(false)
      }
    }

    reader.onerror = () => {
      setErro('Erro na leitura do arquivo.')
      setCarregando(false)
    }

    reader.readAsText(file)
  }

  return (
    <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px]">
      <CardHeader className="pb-3 border-b border-[#24334F]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#5B9DFF]" />
            Importador de Dossiê .json do Site Institucional
          </CardTitle>
          <Badge className="bg-[#111A2E] text-[#3DDC74] border border-[#24334F] text-[10px] font-mono">
            V7.2 SYNC
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <p className="text-xs text-[#C7D0E0] leading-relaxed">
          Se você realizou o pré-diagnóstico no site institucional da Vetor Master e fez o download
          do seu arquivo <code className="text-[#5B9DFF]">dossie-*.json</code>, carregue-o abaixo
          para processar instantaneamente a análise determinística no app.
        </p>

        <div className="border-2 border-dashed border-[#24334F] hover:border-[#5B9DFF]/60 rounded-[4px] p-6 text-center transition-colors bg-[#111A2E]/50">
          <input
            type="file"
            id="dossie-file-input"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="dossie-file-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-[#16213A] flex items-center justify-center text-[#5B9DFF] border border-[#24334F]">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#F8FAFC]">
              Clique para selecionar o dossiê .json
            </div>
            <div className="text-[11px] text-[#8B98B4]">
              Formatos aceitos: arquivos exportados pelo site Vetor Master V7.2
            </div>
          </label>
        </div>

        {erro && (
          <div className="p-3 rounded-[4px] bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        {dadosCarregados && (
          <div className="p-3.5 rounded-[4px] bg-[#111A2E] border border-[#3DDC74]/40 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3DDC74]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dossiê validado com sucesso!</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#C7D0E0] pt-1">
              <div>
                <span className="text-[#8B98B4]">Empresa: </span>
                {dadosCarregados.empresa['Razão Social'] ||
                  dadosCarregados.empresa.razao_social ||
                  'Não informada'}
              </div>
              <div>
                <span className="text-[#8B98B4]">Setor: </span>
                <span className="capitalize">{dadosCarregados.setor_id}</span>
              </div>
              <div>
                <span className="text-[#8B98B4]">Pilares analisados: </span>
                {dadosCarregados.respostas_3_pilares.length} itens
              </div>
              <div>
                <span className="text-[#8B98B4]">Versão: </span>
                <span className="font-mono text-[#5B9DFF]">
                  {dadosCarregados.questionario_version}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
