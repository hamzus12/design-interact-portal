import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting interview simulation request');
    
    if (!lovableApiKey) {
      throw new Error('Lovable AI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, conversationHistory, jobId, candidateProfile } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing interview simulation for job:', jobId);

    // Get job details if jobId provided
    let jobContext = '';
    if (jobId) {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('title, company, description, category')
        .eq('id', jobId)
        .single();

      if (!jobError && job) {
        jobContext = `\n\nEntretien pour le poste: ${job.title} chez ${job.company}\nDescription du poste: ${job.description}\nCatégorie: ${job.category}`;
      }
    }

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `Tu es un recruteur expérimenté qui mène un entretien d'embauche professionnel. 
        
CONTEXTE:${jobContext}

INSTRUCTIONS:
- Pose des questions pertinentes et professionnelles
- Adapte tes questions au profil du candidat et au poste
- Sois bienveillant mais évalue les compétences
- Pose une question à la fois
- Donne des retours constructifs
- Commence par te présenter brièvement et présenter l'entreprise/poste
- Pose des questions sur l'expérience, les compétences techniques, les soft skills
- Termine par demander si le candidat a des questions

STYLE:
- Professionnel mais chaleureux
- Questions ouvertes pour encourager la discussion
- Évite les questions discriminatoires
- Reste dans le rôle du recruteur

${candidateProfile ? `Profil du candidat: ${JSON.stringify(candidateProfile)}` : ''}
`
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Sending request to Lovable AI with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        max_tokens: 800,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI API error:', errorData);
      throw new Error(`Lovable AI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received successfully');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Lovable AI');
    }

    const aiResponse = data.choices[0].message.content;

    // Store conversation in database if user is authenticated
    const authHeader = req.headers.get('authorization');
    if (authHeader && jobId) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (!userError && user) {
          // Save conversation to database
          await supabase
            .from('conversation_history')
            .insert({
              user_id: user.id,
              job_id: jobId,
              question: message,
              response: aiResponse
            });
        }
      } catch (error) {
        console.warn('Could not save conversation to database:', error);
        // Don't fail the request if we can't save to database
      }
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in interview-simulation function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during interview simulation',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});