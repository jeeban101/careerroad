import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Eye, Copy, Check, Youtube, BookOpen, Code, Link as LinkIcon } from "lucide-react";
import { useResourceMetadata } from "@/hooks/useResourceMetadata";
import { trackEvent, AnalyticsEvents, type AnalyticsPayload } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

interface ResourceCardProps {
  url: string;
  roadmapId?: number;
  stageIndex?: number;
  onPreview: (url: string, metadata: any) => void;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Youtube className="h-5 w-5 text-red-400" />;
    case "docs":
      return <BookOpen className="h-5 w-5 text-blue-400" />;
    case "interactive":
      return <Code className="h-5 w-5 text-green-400" />;
    default:
      return <LinkIcon className="h-5 w-5 text-purple-400" />;
  }
};

const getTypeLabel = (type: string) => {
  const labels = {
    video: "📺 Video",
    docs: "📘 Docs",
    interactive: "💻 Interactive",
    article: "🔗 Article",
  };
  return labels[type as keyof typeof labels] || "🔗 Resource";
};

export default function ResourceCard({ url, roadmapId, stageIndex, onPreview }: ResourceCardProps) {
  const { data: metadata, isLoading } = useResourceMetadata(url, true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const payload: AnalyticsPayload = {
      roadmapId,
      stageIndex,
      resourceUrl: url,
      resourceType: metadata?.type || "unknown",
    };
    
    trackEvent(AnalyticsEvents.RESOURCE_OPENED, payload);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!metadata) return;

    const payload: AnalyticsPayload = {
      roadmapId,
      stageIndex,
      resourceUrl: url,
      resourceType: metadata.type,
    };
    
    trackEvent(AnalyticsEvents.RESOURCE_PREVIEWED, payload);
    onPreview(url, metadata);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      const payload: AnalyticsPayload = {
        roadmapId,
        stageIndex,
        resourceUrl: url,
        resourceType: metadata?.type || "unknown",
      };
      
      trackEvent(AnalyticsEvents.RESOURCE_COPIED, payload);
      
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-gray-800/40 border border-gray-700/50 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </Card>
    );
  }

  const title = metadata?.title || url;
  const hostname = metadata?.hostname || new URL(url).hostname;
  const type = metadata?.type || "article";
  const canPreview = metadata?.canEmbed || type === "video" || type === "interactive";

  return (
    <Card
      className="group relative p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
      data-testid={`resource-card-${url}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getResourceIcon(type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
              {title}
            </h4>
            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              {getTypeLabel(type)}
            </span>
          </div>
          
          <p className="text-xs text-gray-400 mb-3 truncate">
            {hostname}
          </p>

          <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-500/50 text-blue-300 hover:text-blue-200"
              onClick={handleOpen}
              aria-label={`Open ${title} in new tab`}
              data-testid={`button-open-${url}`}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open ▶
            </Button>

            {canPreview && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30 hover:border-purple-500/50 text-purple-300 hover:text-purple-200"
                onClick={handlePreview}
                aria-label={`Preview ${title} inside CareerRoad`}
                data-testid={`button-preview-${url}`}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview ⤢
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs bg-gray-600/20 border-gray-500/30 hover:bg-gray-600/30 hover:border-gray-500/50 text-gray-300 hover:text-gray-200"
              onClick={handleCopy}
              aria-label="Copy link to clipboard"
              data-testid={`button-copy-${url}`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
