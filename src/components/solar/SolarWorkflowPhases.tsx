import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SolarWorkflowPhasesProps {
  className?: string
}

const workflowPhases = [
  {
    title: "Calcule a necessidade de geração",
    description: "Cruze histórico de consumo, sazonalidade e metas de economia para definir a energia anual alvo.",
    focus: "Diagnóstico energético",
    outputs: ["Leitura de faturas", "Perfil de carga", "Meta de offset"],
  },
  {
    title: "Entenda o potencial solar da área",
    description: "Conecte dados PVGIS, NASA POWER e BDC para medir irradiação e restrições do entorno.",
    focus: "Dados climáticos",
    outputs: ["Irradiação média", "Temperatura", "Índices de confiabilidade"],
  },
  {
    title: "Dimensione o projeto solar",
    description: "Traduza o potencial em kWp, strings e componentes validados pelo catálogo Yello.",
    focus: "Engenharia",
    outputs: ["Layout preliminar", "Bill of materials", "KPIs de performance"],
  },
  {
    title: "Gere o dossiê solar",
    description: "Monte automaticamente relatórios técnicos, memoriais e simulações financeiras prontas para o cliente final.",
    focus: "Documentação",
    outputs: ["Dossiê PDF", "Proposta financeira", "Cálculo de payback"],
  },
  {
    title: "Agende a instalação",
    description: "Integre equipes e fornecedores, crie cronogramas e checkpoints com notificações proativas.",
    focus: "Orquestração",
    outputs: ["Cronograma", "Checklist de campo", "Status compartilhável"],
  },
  {
    title: "Comece a gerar sua própria energia",
    description: "Monitore a energização, valide KPIs e envie alertas para garantir o comissionamento perfeito.",
    focus: "Operação contínua",
    outputs: ["Entrega energizada", "KPIs pós-start", "Alertas inteligentes"],
  },
]

export function SolarWorkflowPhases({ className }: SolarWorkflowPhasesProps) {
  return (
    <section
      className={cn(
        "relative isolate mx-auto w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/20 bg-white/90 px-4 py-6 text-zinc-900 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/90 dark:text-zinc-50",
        "scroll-mt-32 sm:px-10 sm:py-12",
        className
      )}
      aria-labelledby="solar-workflow-heading"
      style={{
        paddingTop: "calc(clamp(1.5rem, 3vw, 3.5rem) + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(clamp(1.5rem, 3vw, 3.5rem) + env(safe-area-inset-bottom, 0px))",
        paddingInline: "calc(clamp(1rem, 3vw, 2.5rem) + env(safe-area-inset-left, 0px) + env(safe-area-inset-right, 0px))",
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/10 dark:from-zinc-900/60 dark:via-transparent dark:to-black/20" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-solar-gradient opacity-30 blur-[120px] dark:opacity-60" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-solar-gradient opacity-20 blur-[100px] dark:opacity-40" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Fluxo Solar</p>
            <h2 id="solar-workflow-heading" className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white">
              Jornada completa para viabilizar seu projeto
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
              Cada fase foi desenhada para funcionar em modo claro e escuro, com superfícies em vidro e destaque no gradiente Yello.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full border border-white/40 bg-white/70 px-4 py-1 text-xs font-semibold text-zinc-700 shadow-lg backdrop-blur-lg dark:border-white/10 dark:bg-white/10 dark:text-white">
              Zinc 950 + White Blend
            </span>
            <span className="inline-flex items-center rounded-full border border-white/40 bg-white/70 px-4 py-1 text-xs font-semibold text-zinc-700 shadow-lg backdrop-blur-lg dark:border-white/10 dark:bg-white/10 dark:text-white">
              Glassmorphism Ready
            </span>
          </div>
        </div>

        <ul
          role="list"
          aria-label="Fases do fluxo solar"
          className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]"
        >
          {workflowPhases.map((phase, index) => (
            <li key={phase.title}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group relative h-full overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-5 shadow-lg backdrop-blur-xl transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
              >
                <div className="absolute inset-0 border border-white/10 opacity-0 transition-opacity group-hover:opacity-100 dark:border-white/20" />
                <div className="relative z-10 flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-solar-gradient text-base font-semibold text-white shadow-xl shadow-yellow-500/20"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    <span className="sr-only">Fase {index + 1}</span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      <span className="rounded-full border border-white/40 px-2 py-0.5 text-[0.7rem] font-semibold text-zinc-700 backdrop-blur-sm dark:border-white/20 dark:text-zinc-200">
                        {phase.focus}
                      </span>
                      <span>Etapa {index + 1} de {workflowPhases.length}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {phase.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      {phase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {phase.outputs.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 rounded-3xl border border-white/30 bg-white/70 p-5 text-sm text-zinc-700 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-medium">
            O layout é fluido: colunas se reorganizam abaixo de 768px e elementos mantêm contraste AA para acessibilidade.
          </p>
          <button className="inline-flex items-center justify-center rounded-full border border-transparent bg-solar-gradient px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-yellow-500/30 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70">
            Iniciar diagnóstico solar
          </button>
        </div>
      </div>
    </section>
  )
}
