import { Car, Bike } from "lucide-react";

interface VehicleImageProps {
  type: "CAR" | "MOTORBIKE";
  brand: string;
  model: string;
  className?: string;
}

export function VehicleImage({ type, brand, model, className = "" }: VehicleImageProps) {
  const isCar = type === "CAR";
  const stripeA = isCar ? "oklch(0.96 0.01 240)" : "oklch(0.96 0.012 300)";
  const stripeB = isCar ? "oklch(0.93 0.013 240)" : "oklch(0.93 0.015 300)";

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        background: `repeating-linear-gradient(135deg, ${stripeA} 0 14px, ${stripeB} 14px 28px)`,
      }}
    >
      <div className="absolute inset-0 grid place-items-center">
        {isCar ? (
          <Car className="h-12 w-12 text-zinc-500/50" strokeWidth={1.4} />
        ) : (
          <Bike className="h-12 w-12 text-zinc-500/50" strokeWidth={1.4} />
        )}
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500/80">
        {brand} · {model}
      </div>
    </div>
  );
}
