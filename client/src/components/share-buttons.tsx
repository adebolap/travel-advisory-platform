import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Link2, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the URL manually.",
        variant: "destructive"
      });
    }
  };

  const buttonVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.9 }
  };

  return (
    <div className="flex items-center gap-2">
      {compact ? (
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({
                  title,
                  text: description,
                  url
                });
              } else {
                copyToClipboard();
              }
            }}
          >
            <Share2 className="h-4 w-4 text-primary" />
          </Button>
        </motion.div>
      ) : (
        [
          { icon: <Twitter className="h-4 w-4 text-blue-400" />, url: shareUrls.twitter },
          { icon: <Facebook className="h-4 w-4 text-blue-600" />, url: shareUrls.facebook },
          { icon: <Linkedin className="h-4 w-4 text-blue-700" />, url: shareUrls.linkedin }
        ].map((btn, index) => (
          <motion.div key={index} variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(btn.url, '_blank')}
            >
              {btn.icon}
            </Button>
          </motion.div>
        ))
      )}
      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
        <Button variant="outline" size="icon" onClick={copyToClipboard}>
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </motion.div>
    </div>
  );
}