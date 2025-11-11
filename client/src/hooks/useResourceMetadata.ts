import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface ResourceMetadata {
  type: "video" | "interactive" | "docs" | "article";
  title: string;
  description: string;
  hostname: string;
  previewHtml: string;
  canEmbed: boolean;
  url: string;
}

export function useResourceMetadata(url: string, enabled: boolean = true) {
  return useQuery<ResourceMetadata>({
    queryKey: ["resource-metadata", url],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/resource-metadata", { url });
      return response.json();
    },
    enabled: enabled && !!url,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1,
  });
}
