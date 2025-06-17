
import { useState } from "react";

export const useDocumentControls = () => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return {
    zoom,
    rotation,
    handleZoomIn,
    handleZoomOut,
    handleRotate
  };
};
