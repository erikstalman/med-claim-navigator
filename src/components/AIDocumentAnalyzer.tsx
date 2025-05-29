
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

interface AIDocumentAnalyzerProps {
  documentId: string;
  documentContent: string;
  documentType: string;
  caseContext: string;
  onAnalysisComplete?: (analysis: string) => void;
}

const AIDocumentAnalyzer = ({ 
  documentId, 
  documentContent, 
  documentType, 
  caseContext,
  onAnalysisComplete 
}: AIDocumentAnalyzerProps) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const analyzeDocument = async () => {
    setLoading(true);
    try {
      const result = await supabaseService.analyzeDocument(
        documentContent, 
        documentType, 
        caseContext
      );
      
      setAnalysis(result.analysis);
      setAnalyzed(true);
      onAnalysisComplete?.(result.analysis);
      toast.success('Document analysis completed successfully!');
    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`);
      console.error('Document analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisSection = (title: string, content: string, icon: React.ReactNode) => {
    if (!content.includes(title)) return null;
    
    const sectionContent = content.split(title)[1]?.split('\n\n')[0] || '';
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {sectionContent.trim()}
          </div>
        </CardContent>
      </Card>
    );
  };

  const extractClaimValidityRating = (analysis: string) => {
    const ratingMatch = analysis.match(/(?:High|Medium|Low)(?:\s*\/\s*(?:High|Medium|Low))*/i);
    if (!ratingMatch) return null;
    
    const rating = ratingMatch[0].toLowerCase();
    const color = rating.includes('high') ? 'bg-green-100 text-green-800' :
                  rating.includes('medium') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800';
    
    return <Badge className={color}>{rating.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Document Analysis</span>
          </CardTitle>
          <CardDescription>
            Advanced AI analysis of document content for medical claim evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Document: {documentType}</span>
            </div>
            {analyzed && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Analysis Complete</span>
              </div>
            )}
          </div>

          {!analyzed && (
            <Button 
              onClick={analyzeDocument} 
              disabled={loading || !documentContent.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Document with AI
                </>
              )}
            </Button>
          )}

          {loading && (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Claim Validity:</span>
              {extractClaimValidityRating(analysis)}
            </div>
          </div>

          {renderAnalysisSection(
            'Document Summary', 
            analysis, 
            <FileText className="h-4 w-4 text-blue-500" />
          )}

          {renderAnalysisSection(
            'Key Medical Information', 
            analysis, 
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}

          {renderAnalysisSection(
            'Missing Information', 
            analysis, 
            <Clock className="h-4 w-4 text-orange-500" />
          )}

          {renderAnalysisSection(
            'Red Flags', 
            analysis, 
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}

          {renderAnalysisSection(
            'Recommendations', 
            analysis, 
            <TrendingUp className="h-4 w-4 text-purple-500" />
          )}

          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {analysis}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIDocumentAnalyzer;
