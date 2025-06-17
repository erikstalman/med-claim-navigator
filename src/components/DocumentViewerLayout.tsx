
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentViewerLayoutProps {
  header: ReactNode;
  documentViewer: ReactNode;
  sidebar: ReactNode;
}

const DocumentViewerLayout = ({ header, documentViewer, sidebar }: DocumentViewerLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {header}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Document Viewer */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="h-full p-0">
              <div className="w-full h-full bg-white border rounded-lg overflow-hidden">
                {documentViewer}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-96 border-l border-gray-200 bg-white">
          {sidebar}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerLayout;
