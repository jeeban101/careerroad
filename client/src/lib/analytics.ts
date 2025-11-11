import { apiRequest } from "./queryClient";

export interface AnalyticsPayload {
  roadmapId?: number;
  stageIndex?: number;
  resourceUrl: string;
  resourceType: string;
  [key: string]: any;
}

export async function trackEvent(event: string, payload: AnalyticsPayload): Promise<void> {
  try {
    await apiRequest("POST", "/api/analytics/events", {
      event,
      payload,
    });
  } catch (error) {
    console.error(`Failed to track ${event} event:`, error);
  }
}

export const AnalyticsEvents = {
  RESOURCE_OPENED: "resource_opened",
  RESOURCE_PREVIEWED: "resource_previewed",
  RESOURCE_COPIED: "resource_copied",
} as const;
