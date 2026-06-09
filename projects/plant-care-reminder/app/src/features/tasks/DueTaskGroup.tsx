import { DueTaskCard, type DueTaskCardData } from "./DueTaskCard";

interface DueTaskGroupProps {
  description: string;
  eyebrow: string;
  onOpenPlant: (plantId: string) => void;
  tasks: DueTaskCardData[];
  title: string;
}

export function DueTaskGroup({
  description,
  eyebrow,
  onOpenPlant,
  tasks,
  title,
}: DueTaskGroupProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <p style={eyebrowStyle}>{eyebrow}</p>
        <h2 style={titleStyle}>{title}</h2>
        <p style={descriptionStyle}>{description}</p>
      </div>
      <div style={listStyle}>
        {tasks.map((task) => (
          <DueTaskCard
            key={task.taskId}
            onOpenPlant={onOpenPlant}
            task={task}
          />
        ))}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const headerStyle: React.CSSProperties = {
  display: "grid",
  gap: "4px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf)",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.72rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.35rem",
  lineHeight: 1.12,
  letterSpacing: "-0.03em",
};

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.95rem",
  lineHeight: 1.6,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
};
