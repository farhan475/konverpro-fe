import { cn } from "../utils";

interface ControlHeroMetric {
  label: string;
  value: React.ReactNode;
  description: string;
  tone?: "default" | "accent" | "success";
}

interface ControlHeroAsideCard {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "default" | "amber" | "blue";
}

interface ControlHeroProps {
  badge: string;
  title: string;
  description: string;
  metrics: ControlHeroMetric[];
  aside: ControlHeroAsideCard[];
  actions?: React.ReactNode;
}

const metricValueToneClass: Record<
  NonNullable<ControlHeroMetric["tone"]>,
  string
> = {
  default: "text-white",
  accent: "text-amber-300",
  success: "text-emerald-300",
};

const asideToneClass: Record<
  NonNullable<ControlHeroAsideCard["tone"]>,
  string
> = {
  default: "border-slate-100 bg-white",
  amber: "border-amber-100 bg-amber-50/70",
  blue: "border-blue-100 bg-blue-50/75",
};

export default function ControlHero({
  badge,
  title,
  description,
  metrics,
  aside,
  actions,
}: ControlHeroProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
      <div className="relative overflow-hidden rounded-[2.75rem] bg-[#031f37] p-8 text-white shadow-[0_28px_80px_rgba(3,31,55,0.22)] lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(253,216,36,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.14),_transparent_30%)]" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
            {badge}
          </p>
          <h3 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-white lg:text-4xl">
            {title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            {description}
          </p>

          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  {metric.label}
                </p>
                <p
                  className={cn(
                    "mt-3 text-2xl font-black lg:text-3xl",
                    metricValueToneClass[metric.tone ?? "default"],
                  )}
                >
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-white/60">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {aside.map((card) => (
          <div
            key={card.title}
            className={cn(
              "rounded-[2.5rem] border p-6 shadow-sm",
              asideToneClass[card.tone ?? "default"],
            )}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {card.eyebrow}
            </p>
            <h4 className="mt-3 text-xl font-black tracking-tight text-[#001a33]">
              {card.title}
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
