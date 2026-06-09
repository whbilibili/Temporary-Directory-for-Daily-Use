import { Button } from "../../components/ui/Button";

interface PlantHeroCardProps {
  plant: {
    archivedAt: number | null;
    createdAt: number;
    description: string | null;
    imageUrl: string | null;
    isArchived: boolean;
    location: string | null;
    name: string;
    note: string | null;
    updatedAt: number;
  };
  actionSlot?: React.ReactNode;
  onBack: () => void;
  onEdit: () => void;
}

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatTimestamp(value: number) {
  return timestampFormatter.format(new Date(value));
}

export function PlantHeroCard({ actionSlot, plant, onBack, onEdit }: PlantHeroCardProps) {
  return (
    <article style={cardStyle}>
      <div style={mediaWrapStyle}>
        {plant.imageUrl ? (
          <img
            alt={`${plant.name} cover`}
            src={plant.imageUrl}
            style={imageStyle}
          />
        ) : (
          <div style={imageFallbackStyle}>
            <p style={fallbackEyebrowStyle}>Plant profile</p>
            <h2 style={fallbackTitleStyle}>{plant.name}</h2>
            <p style={fallbackCopyStyle}>
              Add a cover photo to make this plant easier to spot in the household board.
            </p>
          </div>
        )}
      </div>

      <div style={bodyStyle}>
        <div style={headlineStyle}>
          <p style={eyebrowStyle}>{plant.location?.trim() || "Shared plant"}</p>
          <h1 style={titleStyle}>{plant.name}</h1>
          {plant.description ? <p style={descriptionStyle}>{plant.description}</p> : null}
        </div>

        <div style={metaGridStyle}>
          <MetaTile label="Care note" value={plant.note?.trim() || "No note saved yet"} />
          <MetaTile label="Created" value={formatTimestamp(plant.createdAt)} />
          <MetaTile label="Updated" value={formatTimestamp(plant.updatedAt)} />
          <MetaTile
            label="Status"
            value={
              plant.isArchived
                ? `Archived${plant.archivedAt ? ` on ${formatTimestamp(plant.archivedAt)}` : ""}`
                : "Active in household board"
            }
          />
        </div>

        <div style={actionsStyle}>
          <Button fullWidth={false} onClick={onEdit} type="button">
            Edit plant
          </Button>
          <Button fullWidth={false} onClick={onBack} type="button" variant="ghost">
            Back to plants
          </Button>
        </div>
        {actionSlot ? <div style={slotStyle}>{actionSlot}</div> : null}
      </div>
    </article>
  );
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={metaTileStyle}>
      <p style={metaLabelStyle}>{label}</p>
      <p style={metaValueStyle}>{value}</p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
  borderRadius: "26px",
  padding: "16px",
  background: "rgba(255,255,255,0.96)",
  border: "1px solid #d9e2ec",
  boxShadow: "0 24px 56px rgba(15,23,42,0.08)",
};

const mediaWrapStyle: React.CSSProperties = {
  borderRadius: "22px",
  overflow: "hidden",
  minHeight: "240px",
  background: "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(249,115,22,0.18))",
};

const imageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  minHeight: "240px",
  maxHeight: "320px",
  objectFit: "cover",
};

const imageFallbackStyle: React.CSSProperties = {
  minHeight: "240px",
  padding: "24px 20px",
  display: "grid",
  alignContent: "end",
  gap: "8px",
};

const fallbackEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#1d4ed8",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.76rem",
  fontWeight: 700,
};

const fallbackTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.8rem",
  lineHeight: 1.05,
  letterSpacing: "-0.05em",
  color: "#0f172a",
};

const fallbackCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "#334155",
  fontSize: "0.98rem",
  lineHeight: 1.6,
};

const bodyStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const headlineStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.76rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "clamp(2rem, 5vw, 3rem)",
  lineHeight: 1,
  letterSpacing: "-0.05em",
};

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
};

const metaTileStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "14px 16px",
  background: "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(219,234,254,0.58))",
  border: "1px solid rgba(147,197,253,0.45)",
  display: "grid",
  gap: "4px",
};

const metaLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.76rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
};

const metaValueStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "0.95rem",
  lineHeight: 1.5,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const slotStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};
