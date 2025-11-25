import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, ArrowRight, ArrowLeft } from "@phosphor-icons/react"
import { motion } from "framer-motion"

export interface WorkflowStep {
  id: string
  title: string
  description: string
  content: ReactNode
  validation?: () => boolean
  optional?: boolean
}

interface WorkflowStepperProps {
  steps: WorkflowStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete: () => void
  className?: string
}

export function WorkflowStepper({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  className = ""
}: WorkflowStepperProps) {
  const progress = ((currentStep + 1) / steps.length) * 100
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const currentStepData = steps[currentStep]
  const canProceed = !currentStepData.validation || currentStepData.validation()

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      onStepChange(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      onStepChange(stepIndex)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Etapa {currentStep + 1} de {steps.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}% completo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isAccessible = index <= currentStep

            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                    ${isCurrent ? 'bg-accent text-accent-foreground' : ''}
                    ${isCompleted ? 'bg-muted hover:bg-muted/80 cursor-pointer' : ''}
                    ${!isAccessible ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isCompleted ? 'bg-accent text-accent-foreground' : ''}
                      ${isCurrent ? 'bg-background text-foreground' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                    `}
                  >
                    {isCompleted ? <Check size={14} weight="bold" /> : index + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">
                    {step.title}
                  </span>
                </button>
                
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-border mx-1" />
                )}
              </div>
            )
          })}
        </div>

        <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
        <CardDescription>{currentStepData.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStepData.content}
        </motion.div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ArrowLeft size={16} weight="bold" />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            {currentStepData.optional && (
              <Button
                variant="ghost"
                onClick={handleNext}
              >
                Pular
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="gap-2"
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
              {!isLastStep && <ArrowRight size={16} weight="bold" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
