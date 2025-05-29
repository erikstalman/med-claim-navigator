
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentContent, documentType, caseContext } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert medical claims analyst AI. Analyze the provided document and provide:

1. **Document Summary**: Brief overview of the document content
2. **Key Medical Information**: Extract medical findings, diagnoses, treatments
3. **Missing Information**: Identify what additional info is needed for claim evaluation
4. **Red Flags**: Highlight any inconsistencies or concerning elements
5. **Recommendations**: Suggest next steps for claim processing
6. **Claim Validity Assessment**: Rate likelihood of claim approval (High/Medium/Low) with reasoning

Format your response in clear sections with bullet points for easy reading.`;

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
            content: `Document Type: ${documentType}\n\nCase Context: ${caseContext}\n\nDocument Content:\n${documentContent}` 
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API request failed');
    }

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString(),
      model: 'gpt-4o-mini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
