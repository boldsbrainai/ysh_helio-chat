import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, BatteryCharging, Lightning, ArrowDown, ArrowUp } from "@phosphor-icons/react";

export type EnergyStatus = "low" | "medium" | "high";

export interface EnergyStatusCardProps {
  title: string;
  value: number;
  unit: string;
  status: EnergyStatus;
  icon?: "sun" | "battery" | "zap" | "import" | "export";
  description?: string;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  className?: string;
}

export const EnergyStatusCard: React.FC<EnergyStatusCardProps> = ({
  title,
  value,
  unit,
  status,
  icon = "sun",
  description,
  change,
  className,
}) => {
  const statusColors = {
    low: "text-success",
    medium: "text-warning",
    high: "text-error",
  };

  const icons = {
    sun: <Sun className="w-6 h-6" weight="fill" />,
    battery: <BatteryCharging className="w-6 h-6" weight="fill" />,
    zap: <Lightning className="w-6 h-6" weight="fill" />,
    import: <ArrowDown className="w-6 h-6" weight="bold" />,
    export: <ArrowUp className="w-6 h-6" weight="bold" />,
  };

  const formattedValue = typeof value === "number" ? value.toFixed(1) : value;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className={cn("p-2 rounded-full bg-background", statusColors[status])}>
            {icons[icon]}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{formattedValue}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          
          {change && (
            <div className="flex items-center mt-2">
              {change.type === "increase" ? (
                <ArrowUp className="w-4 h-4 text-success mr-1" weight="bold" />
              ) : (
                <ArrowDown className="w-4 h-4 text-error mr-1" weight="bold" />
              )}
              <span className={cn(
                "text-xs font-medium",
                change.type === "increase" ? "text-success" : "text-error"
              )}>
                {change.value.toFixed(1)}% {change.type === "increase" ? "more" : "less"} than {change.period}
              </span>
            </div>
          )}
          
          <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                status === "low" ? "bg-success" : 
                status === "medium" ? "bg-warning" : 
                "bg-error"
              )}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnergyStatusCard;
