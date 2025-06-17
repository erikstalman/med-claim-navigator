
import { Button } from "@/components/ui/button";

interface DocumentNotFoundProps {
  onGoBack: () => void;
}

const DocumentNotFound = ({ onGoBack }: DocumentNotFoundProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Document not found</h2>
        <Button onClick={onGoBack}>Go Back</Button>
      </div>
    </div>
  );
};

export default DocumentNotFound;
