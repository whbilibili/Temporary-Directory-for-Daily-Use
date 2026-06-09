import { StorageImage } from "../../components/ui/StorageImage";

interface PlantHeroCardProps {
  plant: {
    archivedAt: number | null;
    createdAt: number;
    description: string | null;
    imageStorageId?: string | null;
    imageUrl: string | null;
    isArchived: boolean;
    location: string | null;
    name: string;
    note: string | null;
    updatedAt: number;
  };
  actionSlot?: React.ReactNode;
}

const timestampFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatTimestamp(value: number) {
  return timestampFormatter.format(new Date(value));
}

export function PlantHeroCard({ actionSlot, plant }: PlantHeroCardProps) {
  const statusSummary = plant.isArchived
    ? `已归档${plant.archivedAt ? `，归档于 ${formatTimestamp(plant.archivedAt)}` : ""}`
    : "正在家庭看板中使用";
  const note = plant.note?.trim();

  return (
    <article style={cardStyle}>
      <div style={heroWrapStyle}>
        <StorageImage
          alt={`${plant.name}封面图`}
          initialUrl={plant.imageUrl}
          storageId={plant.imageStorageId as never}
          style={heroImageStyle}
          fallback={
            <div style={heroPlaceholderStyle}>
              <span aria-hidden="true" style={placeholderIconStyle}>
                🪴
              </span>
              <span style={placeholderTextStyle}>轻触上传植物照片</span>
            </div>
          }
        />
      </div>

      <div style={infoStyle}>
        <h1 style={nameStyle}>{plant.name}</h1>
        {plant.location?.trim() ? (
          <p style={locationStyle}>{plant.location.trim()}</p>
        ) : null}
        <p style={statusStyle}>{statusSummary}</p>
        {plant.description ? <p style={descriptionStyle}>{plant.description}</p> : null}
        {note ? (
          <div style={noteRowStyle}>
            <span style={noteLabelStyle}>养护备注</span>
            <p style={noteStyle}>{note}</p>
          </div>
        ) : null}
      </div>

      {actionSlot ? <div style={slotStyle}>{actionSlot}</div> : null}
    </article>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-md)",
};

const heroWrapStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: "4 / 3",
  overflow: "hidden",
  borderBottomLeftRadius: "24px",
  borderBottomRightRadius: "24px",
  background: "var(--color-mist)",
};

const heroImageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const heroPlaceholderStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-sm)",
  background: "var(--color-mist)",
};

const placeholderIconStyle: React.CSSProperties = {
  fontSize: "64px",
  lineHeight: 1,
  color: "var(--color-line)",
  opacity: 0.7,
};

const placeholderTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--color-muted)",
};

const infoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-xs)",
  padding: "0 var(--space-md)",
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "20px",
  fontWeight: 700,
  lineHeight: 1.2,
  color: "var(--color-ink)",
};

const locationStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 400,
  color: "var(--color-muted)",
};

const statusStyle: React.CSSProperties = {
  margin: 0,
  marginTop: "var(--space-xs)",
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-leaf-light)",
};

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  marginTop: "var(--space-xs)",
  fontSize: "14px",
  lineHeight: 1.6,
  color: "var(--color-muted)",
};

const noteRowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  marginTop: "var(--space-xs)",
};

const noteLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--color-leaf-light)",
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "14px",
  lineHeight: 1.6,
  color: "var(--color-muted)",
};

const slotStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-md)",
  padding: "0 var(--space-md)",
};
