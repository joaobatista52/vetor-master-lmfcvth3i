import { AdminLogs } from '@/components/admin/admin-logs'

export default function AdminLogsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe todas as ações realizadas nas notas do projeto.
        </p>
      </div>
      <AdminLogs />
    </div>
  )
}
