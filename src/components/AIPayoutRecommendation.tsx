
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Brain, CheckCircle, AlertTriangle, FileText, TrendingUp } from "lucide-react";

interface AIPayoutRecommendationProps {
  caseId: string;
}

const AIPayoutRecommendation = ({ caseId }: AIPayoutRecommendationProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // Mock AI analysis data
  const analysis = {
    caseId,
    patientName: "John Anderson",
    claimAmount: 45000,
    recommendedPayout: 32500,
    confidence: 87,
    riskLevel: "Medium",
    factors: {
      positive: [
        "Clear medical connection established",
        "Consistent symptom presentation",
        "Moderate disability grade (26-50%)",
        "No pre-existing conditions"
      ],
      negative: [
        "Some competing conditions identified",
        "Partial time-limited connection"
      ],
      neutral: [
        "Standard documentation quality",
        "Typical recovery timeline"
      ]
    },
    policyTerms: {
      maxCoverage: 50000,
      deductible: 1000,
      coverageType: "Comprehensive Motor Vehicle",
      policyNumber: "POL-12345678"
    },
    breakdown: {
      medicalExpenses: 18500,
      lostWages: 12000,
      painSuffering: 2000,
      adjustments: -500
    },
    comparison: {
      similarCases: 15,
      averagePayout: 28750,
      industryStandard: 30200
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Payout Recommendation</span>
          </CardTitle>
          <CardDescription>
            AI-powered analysis for case {caseId} - {analysis.patientName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                ${analysis.recommendedPayout.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Recommended Payout</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                ${analysis.claimAmount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Claimed Amount</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getConfidenceColor(analysis.confidence)}`}>
                {analysis.confidence}%
              </div>
              <p className="text-sm text-gray-600">AI Confidence</p>
            </div>
            <div className="text-center">
              <Badge className={getRiskColor(analysis.riskLevel)}>
                {analysis.riskLevel} Risk
              </Badge>
              <p className="text-sm text-gray-600 mt-1">Risk Assessment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence and Risk Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confidence Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>AI Confidence Level</span>
                  <span className="font-medium">{analysis.confidence}%</span>
                </div>
                <Progress value={analysis.confidence} className="h-2" />
              </div>
              <div className="text-sm text-gray-600">
                Based on analysis of medical documentation, policy terms, and comparison with similar cases.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policy Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Policy Type:</span>
                <span className="font-medium">{analysis.policyTerms.coverageType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Coverage:</span>
                <span className="font-medium">${analysis.policyTerms.maxCoverage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deductible:</span>
                <span className="font-medium">${analysis.policyTerms.deductible.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Policy Number:</span>
                <span className="font-medium">{analysis.policyTerms.policyNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Factors Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contributing Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-green-700 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Positive Factors
              </h4>
              <ul className="space-y-2 text-sm">
                {analysis.factors.positive.map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-700 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Negative Factors
              </h4>
              <ul className="space-y-2 text-sm">
                {analysis.factors.negative.map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Neutral Factors
              </h4>
              <ul className="space-y-2 text-sm">
                {analysis.factors.neutral.map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payout Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Medical Expenses</span>
                <span className="font-medium">${analysis.breakdown.medicalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lost Wages</span>
                <span className="font-medium">${analysis.breakdown.lostWages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pain & Suffering</span>
                <span className="font-medium">${analysis.breakdown.painSuffering.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Adjustments</span>
                <span className="font-medium text-red-600">${analysis.breakdown.adjustments.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Recommended</span>
                  <span className="text-blue-600">${analysis.recommendedPayout.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Market Comparison
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Similar Cases ({analysis.comparison.similarCases}):</span>
                  <span className="font-medium">${analysis.comparison.averagePayout.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry Standard:</span>
                  <span className="font-medium">${analysis.comparison.industryStandard.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Our Recommendation:</span>
                  <span className="font-medium text-blue-600">${analysis.recommendedPayout.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"} Detailed Analysis
            </Button>
            <div className="space-x-3">
              <Button variant="outline">
                Request Manual Review
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                Approve Recommendation
              </Button>
            </div>
          </div>

          {showDetails && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Detailed AI Analysis Notes</h4>
              <Textarea
                readOnly
                value="The AI analysis considered multiple factors including the strength of medical documentation, consistency of symptom presentation, policy coverage limits, and comparative analysis with similar claims. The recommended payout of $32,500 represents 72% of the claimed amount, which aligns with industry standards for cases with moderate disability grades and clear medical connections. The analysis accounts for the time-limited nature of some symptoms while recognizing the established causal relationship with the accident."
                className="min-h-[100px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPayoutRecommendation;
