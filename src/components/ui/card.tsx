import { ComponentProps, useState, ReactNode, isValidElement } from "react"
import { CaretDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface CardProps extends ComponentProps<"div"> {
  collapsible?: boolean
  defaultCollapsed?: boolean
}

function Card({ className, collapsible, defaultCollapsed, children, ...props }: CardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed ?? false)

  if (!collapsible) {
    return (
      <div
        className={cn(
          "bg-card/90 backdrop-blur-md text-card-foreground flex flex-col gap-6 rounded-xl border border-border/50 py-6 shadow-md hover:shadow-xl hover:border-accent/30 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  const childrenArray = Array.isArray(children) ? children : [children]
  const header = childrenArray.find((child) => isValidElement(child) && child.props?.['data-slot'] === 'card-header')
  const otherChildren = childrenArray.filter((child) => !isValidElement(child) || child.props?.['data-slot'] !== 'card-header')

  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm overflow-hidden transition-all",
        className
      )}
      {...props}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/5 transition-colors text-left"
      >
        <div className="flex-1">{header}</div>
        <CaretDown
          size={20}
          weight="bold"
          className={cn(
            "transition-transform flex-shrink-0 ml-2",
            isCollapsed ? "" : "rotate-180"
          )}
        />
      </button>
      {!isCollapsed && (
        <div className="flex flex-col gap-6 pb-6">
          {otherChildren}
        </div>
      )}
    </div>
  )
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
