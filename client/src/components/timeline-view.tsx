import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, GripVertical, ThumbsUp, ThumbsDown, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  time: string;
  activity: string;
  location?: string;
  type: 'custom' | 'event' | 'attraction';
}

interface TimelineViewProps {
  items: TimelineItem[];
  onReorder: (items: TimelineItem[]) => void;
  onApprove?: (itemId: string) => void;
  onRefresh?: (itemIndex: number) => void;
  onRemove?: (itemIndex: number) => void;
  approvedItems?: Set<string>;
  refreshingIndex?: number;
}

export default function TimelineView({ 
  items, 
  onReorder, 
  onApprove, 
  onRefresh, 
  onRemove, 
  approvedItems = new Set(),
  refreshingIndex 
}: TimelineViewProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === id) return;

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const hoverIndex = items.findIndex(item => item.id === id);

    if (draggedIndex === hoverIndex) return;

    const newItems = [...items];
    const draggedItemContent = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItemContent);

    onReorder(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="relative pl-4 space-y-4">
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative flex gap-4 items-start group",
            draggedItem === item.id && "opacity-50"
          )}
        >
          {/* Timeline dot */}
          <div className="absolute -left-[1.35rem] w-3 h-3 rounded-full bg-primary" />

          <Card className="flex-1 cursor-move hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {item.time}
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  {onApprove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onApprove(item.id)}
                      className={`opacity-0 group-hover:opacity-100 ${
                        approvedItems.has(item.id) ? "text-green-500 opacity-100" : ""
                      }`}
                      title="I like this"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onRefresh && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRefresh(index)}
                      className="opacity-0 group-hover:opacity-100"
                      disabled={refreshingIndex !== undefined}
                      title="Show me something else"
                    >
                      {refreshingIndex === index ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ThumbsDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  {onRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(index)}
                      className="opacity-0 group-hover:opacity-100"
                      title="Remove activity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-1">{item.activity}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
