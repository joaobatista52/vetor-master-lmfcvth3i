import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminNotes } from '@/components/admin/admin-notes'
import { AdminUsers } from '@/components/admin/admin-users'

export default function Admin() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-1">Gerencie todas as notas e usuários do sistema.</p>
      </div>
      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="notes">
          <AdminNotes />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>
      </Tabs>
    </div>
  )
}
