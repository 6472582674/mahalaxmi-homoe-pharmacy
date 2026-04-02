import { useEffect, useState } from "react";
import type { Product } from "../data/products";
import { getOrCreateStorageClient } from "./useStorageClient";

const urlCache = new Map<string, string>();

export function useProductImage(product: Product | null | undefined) {
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    if (!product?.imageHash) return null;
    return urlCache.get(product.imageHash) ?? null;
  });

  useEffect(() => {
    if (!product?.imageHash) {
      setImageUrl(null);
      return;
    }

    const hash = product.imageHash;

    if (urlCache.has(hash)) {
      setImageUrl(urlCache.get(hash)!);
      return;
    }

    let cancelled = false;

    getOrCreateStorageClient()
      .then((client) => client.getDirectURL(hash))
      .then((url) => {
        if (!cancelled) {
          urlCache.set(hash, url);
          setImageUrl(url);
        }
      })
      .catch((err) => {
        console.warn("Failed to get product image URL", err);
        if (!cancelled) setImageUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [product?.imageHash]);

  return { imageUrl };
}
