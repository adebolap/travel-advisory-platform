```typescript
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Link2, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  description?: string;
  url: string;
  compact?: boolean;
}

export default function ShareButtons({ title, description, url, compact = false }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({
                title,
                text: description,
                url,
              });
            } else {
              copyToClipboard();
            }
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="hover:text-blue-400"
        onClick={() => window.open(shareUrls.twitter, '_blank')}
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="hover:text-blue-600"
        onClick={() => window.open(shareUrls.facebook, '_blank')}
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="hover:text-blue-700"
        onClick={() => window.open(shareUrls.linkedin, '_blank')}
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
```
