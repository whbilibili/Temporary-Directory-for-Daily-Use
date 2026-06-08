import { useConvex, useMutation } from "convex/react";
import { useEffect, useId, useRef, useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";
import type { StorageId } from "../../types/domain";
import { uploadPlantImage } from "./uploadPlantImage";

export interface PlantImageValue {
  previewUrl: string | null;
  storageId: StorageId | null;
}

interface PlantImageFieldProps {
  disabled?: boolean;
  hint?: string;
  label?: string;
  onChange: (value: PlantImageValue) => void;
  value: PlantImageValue;
}

export function PlantImageField({
  disabled = false,
  hint = "Upload a square or portrait plant photo. The stored value stays as a Convex storage id.",
  label = "Plant cover photo",
  onChange,
  value,
}: PlantImageFieldProps) {
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const localPreviewUrlRef = useRef<string | null>(null);
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.plants.generatePlantImageUploadUrl);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "uploaded">("idle");
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  const previewUrl = localPreviewUrl ?? value.previewUrl;

  const handleSelectClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const nextLocalPreviewUrl = URL.createObjectURL(file);
    if (localPreviewUrlRef.current) {
      URL.revokeObjectURL(localPreviewUrlRef.current);
    }
    localPreviewUrlRef.current = nextLocalPreviewUrl;

    setLocalPreviewUrl(nextLocalPreviewUrl);
    setPendingFileName(file.name);
    setUploadError(null);
    setUploadState("uploading");

    try {
      const uploadedImage = await uploadPlantImage({
        file,
        generateUploadUrl: () => generateUploadUrl({}),
        getPlantImageUrl: (storageId) =>
          convex.query(api.plants.getPlantImageUrl, {
            storageId: storageId as never,
          }),
      });

      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
        localPreviewUrlRef.current = null;
      }

      setLocalPreviewUrl(null);
      setUploadState("uploaded");
      onChange(uploadedImage);
    } catch (error) {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
        localPreviewUrlRef.current = null;
      }

      setLocalPreviewUrl(null);
      setUploadState("idle");
      setPendingFileName(null);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Plant image upload failed. Please try again.",
      );
    }
  };

  return (
    <section style={fieldStyle}>
      <div style={headerStyle}>
        <label htmlFor={fieldId} style={labelStyle}>
          {label}
        </label>
        <p style={hintStyle}>{hint}</p>
      </div>

      <div style={previewCardStyle}>
        {previewUrl ? (
          <img
            alt="Selected plant cover preview"
            src={previewUrl}
            style={previewImageStyle}
          />
        ) : (
          <div aria-live="polite" style={previewPlaceholderStyle}>
            <p style={previewPlaceholderEyebrowStyle}>No image yet</p>
            <p style={previewPlaceholderCopyStyle}>
              Add a bright plant photo so future plant cards can lead with imagery.
            </p>
          </div>
        )}
      </div>

      <div style={statusRowStyle}>
        <span style={metaPillStyle}>
          {uploadState === "uploading"
            ? `Uploading ${pendingFileName ?? "image"}`
            : value.storageId
              ? "Stored in Convex"
              : "Ready to upload"}
        </span>
        {value.storageId ? <span style={storageIdStyle}>Storage id: {value.storageId}</span> : null}
      </div>

      <input
        id={fieldId}
        ref={fileInputRef}
        accept="image/*"
        disabled={disabled}
        onChange={handleFileChange}
        style={hiddenInputStyle}
        type="file"
      />

      <div style={actionsStyle}>
        <Button
          disabled={disabled || uploadState === "uploading"}
          onClick={handleSelectClick}
          type="button"
          variant={previewUrl ? "secondary" : "primary"}
        >
          {uploadState === "uploading"
            ? "Uploading image..."
            : previewUrl
              ? "Replace photo"
              : "Upload photo"}
        </Button>
      </div>

      <FormError message={uploadError} />
    </section>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
};

const headerStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#1e293b",
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const previewCardStyle: React.CSSProperties = {
  minHeight: "216px",
  borderRadius: "22px",
  overflow: "hidden",
  border: "1px solid #d9e2ec",
  background:
    "linear-gradient(140deg, rgba(37,99,235,0.1) 0%, rgba(248,250,252,1) 62%, rgba(249,115,22,0.08) 100%)",
};

const previewImageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  minHeight: "216px",
  maxHeight: "320px",
  objectFit: "cover",
};

const previewPlaceholderStyle: React.CSSProperties = {
  minHeight: "216px",
  padding: "24px",
  display: "grid",
  alignContent: "end",
  gap: "8px",
};

const previewPlaceholderEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontWeight: 700,
};

const previewPlaceholderCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "#334155",
  fontSize: "1rem",
  lineHeight: 1.6,
};

const statusRowStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
};

const metaPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "rgba(37,99,235,0.1)",
  color: "#1d4ed8",
  fontSize: "0.82rem",
  fontWeight: 700,
};

const storageIdStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "0.84rem",
  lineHeight: 1.5,
  wordBreak: "break-all",
};

const hiddenInputStyle: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const actionsStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};
