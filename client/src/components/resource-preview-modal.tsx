import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import type { ResourceMetadata } from "@/hooks/useResourceMetadata";

interface ResourcePreviewModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  metadata: ResourceMetadata | null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
    }
  } catch (error) {
    console.error("Failed to parse YouTube URL:", error);
  }
  return null;
}

function getCodePenEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    if (pathParts.length >= 4) {
      const user = pathParts[1];
      const penId = pathParts[3];
      return `https://codepen.io/${user}/embed/${penId}?default-tab=result`;
    }
  } catch (error) {
    console.error("Failed to parse CodePen URL:", error);
  }
  return null;
}

export default function ResourcePreviewModal({
  open,
  onClose,
  url,
  metadata,
}: ResourcePreviewModalProps) {
  if (!metadata) {
    return null;
  }

  const renderPreview = () => {
    const { type, title, description, previewHtml, canEmbed } = metadata;

    // YouTube preview
    if (type === "video") {
      const embedUrl = getYouTubeEmbedUrl(url);
      if (embedUrl) {
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // CodePen preview
    if (type === "interactive") {
      const embedUrl = getCodePenEmbedUrl(url);
      if (embedUrl) {
        return (
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        );
      }
    }

    // Article preview
    if (type === "article" && previewHtml) {
      return (
        <div className="space-y-4">
          <div
            className="prose prose-invert max-w-none text-gray-300"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
          {description && (
            <p className="text-sm text-gray-400 italic border-l-2 border-purple-500/50 pl-4">
              {description}
            </p>
          )}
        </div>
      );
    }

    // Fallback - show description and open button
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-gray-400">
          {description ? (
            <p className="text-sm mb-4">{description}</p>
          ) : (
            <p className="text-sm">Preview not available for this resource.</p>
          )}
          {!canEmbed && (
            <p className="text-xs text-gray-500 mt-2">
              This site cannot be embedded due to security restrictions.
            </p>
          )}
        </div>
        <Button
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Tab
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700 text-white overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-white mb-2 line-clamp-2">
                {metadata.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400 truncate">
                {metadata.hostname}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 hover:bg-gray-800"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {renderPreview()}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
