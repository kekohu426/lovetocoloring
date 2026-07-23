import Link from "next/link";
import { BookOpenCheck, Check, Download, Palette, PencilLine } from "lucide-react";

const steps = [
  { label: "Create", Icon: PencilLine },
  { label: "Pick colors", Icon: Palette },
  { label: "Color guide", Icon: BookOpenCheck },
  { label: "Download", Icon: Download },
] as const;

export function WorkflowSteps({
  active,
  links = {},
}: {
  active: 1 | 2 | 3 | 4;
  links?: Partial<Record<1 | 2 | 3 | 4, string>>;
}) {
  return <nav className="workflow-steps" aria-label="Coloring page creation progress">
    <div className="workflow-steps-inner">
      {steps.map(({ label, Icon }, index) => {
        const number = (index + 1) as 1 | 2 | 3 | 4;
        const complete = number < active;
        const current = number === active;
        const content = <>
          <span className="workflow-step-number" aria-hidden="true">{complete ? <Check size={14} strokeWidth={2.4} /> : <Icon size={14} strokeWidth={2} />}</span>
          <b>{label}</b>
        </>;
        return <div className={`workflow-step ${complete ? "complete" : ""} ${current ? "current" : ""}`} key={label} aria-current={current ? "step" : undefined}>
          {links[number] ? <Link href={links[number]!}>{content}</Link> : <span>{content}</span>}
          {number < 4 ? <i aria-hidden="true" /> : null}
        </div>;
      })}
    </div>
  </nav>;
}
