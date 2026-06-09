import { useConvex } from "convex/react";
import { useEffect, useState } from "react";

import { api } from "../../../convex/_generated/api";
import type { StorageId } from "../../types/domain";

interface StorageImageProps {
  alt: string;
  fallback: React.ReactNode;
  initialUrl?: string | null;
  storageId?: StorageId | null;
  style?: React.CSSProperties;
}

export function StorageImage({
  alt,
  fallback,
  initialUrl = null,
  storageId = null,
  style,
}: StorageImageProps) {
  const convex = useConvex();
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl);
  const [hasFailed, setHasFailed] = useState(false);
  const [hasRetried, setHasRetried] = useState(false);

  useEffect(() => {
    setImageUrl(initialUrl);
    setHasFailed(false);
    setHasRetried(false);
  }, [initialUrl, storageId]);

  useEffect(() => {
    if (imageUrl || !storageId || hasRetried) {
      return;
    }

    let isCancelled = false;

    void convex
      .query(api.plants.getPlantImageUrl, {
        storageId: storageId as never,
      })
      .then((result) => {
        if (isCancelled) {
          return;
        }

        setImageUrl(result.imageUrl);
        setHasFailed(false);
        setHasRetried(true);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setHasFailed(true);
        setHasRetried(true);
      });

    return () => {
      isCancelled = true;
    };
  }, [convex, hasRetried, imageUrl, storageId]);

  async function handleImageError() {
    if (!storageId || hasRetried) {
      setHasFailed(true);
      return;
    }

    try {
      const result = await convex.query(api.plants.getPlantImageUrl, {
        storageId: storageId as never,
      });
      setImageUrl(result.imageUrl);
      setHasRetried(true);
      setHasFailed(false);
    } catch {
      setHasFailed(true);
      setHasRetried(true);
    }
  }

  if (!imageUrl || hasFailed) {
    return <>{fallback}</>;
  }

  return <img alt={alt} onError={() => void handleImageError()} src={imageUrl} style={style} />;
}
