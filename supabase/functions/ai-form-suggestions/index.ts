
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseData, documentAnalysis, formType } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an AI assistant specialized in healthcare claims processing. Based on the case information and document analysis provided, generate intelligent suggestions for form completion.

Provide suggestions in the following JSON format:
{
  "suggestions": [
    {
      "field": "field_name",
      "value": "suggested_value",
      "confidence": "high|medium|low",
      "reasoning": "explanation for this suggestion"
    }
  ],
  "recommendations": [
    "Additional recommendations for the evaluator"
  ],
  "missingInfo": [
    "Information that should be requested"
  ]
}

Focus on accuracy and provide confidence levels for each suggestion.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Form Type: ${formType}\n\nCase Data: ${JSON.stringify(caseData, null, 2)}\n\nDocument Analysis: ${documentAnalysis}` 
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API request failed');
    }

    const suggestions = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-form-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [],
      recommendations: [],
      missingInfo: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
