import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Product as BackendProduct } from "../backend.d";
import type { Product } from "../data/products";
import { useActor } from "./useActor";

function backendProductToFrontend(bp: BackendProduct): Product {
  return {
    id: bp.id,
    name: bp.name,
    description: bp.description,
    price: Number(bp.price),
    category: bp.category as Product["category"],
    imageEmoji: bp.imageEmoji,
    imageHash: bp.imageHash,
    stock: Number(bp.stock),
    active: bp.active,
  };
}

export function useProducts() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      const backendProducts = await actor.getProducts();
      return backendProducts.map(backendProductToFrontend);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });

  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, [queryClient]);

  return {
    products: query.data ?? [],
    loading: query.isLoading || isFetching,
    reload,
  };
}
