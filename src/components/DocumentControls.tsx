
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

interface DocumentControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
}

const DocumentControls = ({ zoom, onZoomIn, onZoomOut, onRotate }: DocumentControlsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={onZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
      <Button variant="outline" size="sm" onClick={onZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onRotate}>
        <RotateCw className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DocumentControls;
