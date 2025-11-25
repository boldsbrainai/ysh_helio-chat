import { List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SolarWorkflowWizard } from "@/components/solar/SolarWorkflowWizard"
import { toast } from "sonner"

interface SolarWorkflowPageProps {
  onToggleSidebar: () => void
}

export function SolarWorkflowPage({ onToggleSidebar }: SolarWorkflowPageProps) {
  const handleComplete = (data: any) => {
    console.log("Workflow completed with data:", data)
    toast.success("Proposta solar finalizada com sucesso!", {
      description: "Todos os dados foram salvos e estão disponíveis para download."
    })
  }

  const handleCancel = () => {
    toast.info("Workflow cancelado")
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header
        className="flex items-center justify-between h-[60px] px-4 sm:px-6 border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm flex-shrink-0"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1.5rem, env(safe-area-inset-right))"
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors"
            aria-label="Abrir menu"
          >
            <List size={20} weight="bold" />
          </button>
          <div>
            <h1 className="text-base font-bold">Dimensionamento Solar Completo</h1>
            <p className="text-xs text-muted-foreground">Workflow end-to-end</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="py-6">
          <SolarWorkflowWizard onComplete={handleComplete} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  )
}
