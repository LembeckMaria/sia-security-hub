import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensorCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  color: "success" | "warning" | "danger" | "info";
  threshold?: {
    low: number;
    medium: number;
    high: number;
  };
  currentValue: number;
}

export const SensorCard = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  threshold,
  currentValue
}: SensorCardProps) => {
  const getStatusColor = () => {
    if (!threshold) return color;
    
    if (currentValue >= threshold.high) return "danger";
    if (currentValue >= threshold.medium) return "warning";
    if (currentValue >= threshold.low) return "success";
    return "success";
  };

  const statusColor = getStatusColor();

  const colorClasses = {
    success: "bg-success/10 border-success/30",
    warning: "bg-warning/10 border-warning/30",
    danger: "bg-danger/10 border-danger/30",
    info: "bg-info/10 border-info/30"
  };

  const badgeClasses = {
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    danger: "bg-danger text-white",
    info: "bg-info text-white"
  };

  return (
    <Card className={cn(
      "p-6 shadow-metal hover:shadow-strong transition-all duration-300",
      colorClasses[statusColor]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{value}</span>
            {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
          </div>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          statusColor === "danger" ? "gradient-petroleum shadow-glow" :
          statusColor === "warning" ? "gradient-gold" :
          "gradient-metal"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            statusColor === "danger" || statusColor === "warning" ? "text-white" : "text-foreground"
          )} />
        </div>
      </div>

      {threshold && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                statusColor === "danger" ? "bg-danger" :
                statusColor === "warning" ? "bg-warning" :
                "bg-success"
              )}
              style={{ 
                width: `${Math.min(100, (currentValue / threshold.high) * 100)}%` 
              }}
            />
          </div>
          <Badge variant="outline" className={cn("text-xs", badgeClasses[statusColor])}>
            {statusColor === "danger" ? "Alto" :
             statusColor === "warning" ? "Médio" :
             "Normal"}
          </Badge>
        </div>
      )}
    </Card>
  );
};
