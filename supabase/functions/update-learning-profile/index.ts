import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, jobData, feedbackData, applicationResult } = await req.json();

    if (!user_id || !jobData || !feedbackData) {
      throw new Error("Missing required data");
    }

    console.log("Learning profile update request received:", { 
      userId: user_id,
      jobTitle: jobData.title,
      applicationResult: applicationResult || "pending" 
    });
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get current user data
    const { data: userData, error: userError } = await supabase
      .auth.admin.getUserById(user_id);
      
    if (userError || !userData?.user) {
      throw new Error("Error retrieving user data: " + (userError?.message || "User not found"));
    }
    
    // Get current job persona
    const currentPersona = userData.user.user_metadata?.job_persona || {
      skills: [],
      experience: [],
      preferences: {
        jobTypes: [],
        locations: [],
        salary: { min: 0, max: 0 },
        remote: false
      },
      learningProfile: {
        successfulApplications: [],
        rejectedApplications: [],
        feedback: []
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Update learning profile based on feedback
    const updatedPersona = updateLearningProfile(
      currentPersona, 
      jobData, 
      feedbackData, 
      applicationResult
    );
    
    // Save updated persona back to user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user_id,
      {
        user_metadata: {
          ...userData.user.user_metadata,
          job_persona: updatedPersona,
          has_job_persona: true
        }
      }
    );
    
    if (updateError) {
      throw new Error("Error updating user metadata: " + updateError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        personaUpdated: true,
        learningPoints: identifyLearningPoints(feedbackData)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error updating learning profile:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during update" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function updateLearningProfile(
  currentPersona: any,
  jobData: any,
  feedbackData: any,
  applicationResult: string = "pending"
) {
  // Clone the current persona
  const updatedPersona = JSON.parse(JSON.stringify(currentPersona));
  
  // Initialize learning profile if it doesn't exist
  if (!updatedPersona.learningProfile) {
    updatedPersona.learningProfile = {
      successfulApplications: [],
      rejectedApplications: [],
      feedback: []
    };
  }
  
  // Update application tracking lists
  if (applicationResult === "successful" && jobData.id) {
    if (!updatedPersona.learningProfile.successfulApplications.includes(jobData.id)) {
      updatedPersona.learningProfile.successfulApplications.push(jobData.id);
    }
  } else if (applicationResult === "rejected" && jobData.id) {
    if (!updatedPersona.learningProfile.rejectedApplications.includes(jobData.id)) {
      updatedPersona.learningProfile.rejectedApplications.push(jobData.id);
    }
  }
  
  // Add new feedback
  if (feedbackData.message) {
    updatedPersona.learningProfile.feedback.push({
      jobId: jobData.id || "unknown",
      message: feedbackData.message,
      timestamp: new Date().toISOString(),
      sentimentScore: feedbackData.sentimentScore || calculateSentiment(feedbackData.message)
    });
    
    // Keep only the most recent 20 feedback entries
    if (updatedPersona.learningProfile.feedback.length > 20) {
      updatedPersona.learningProfile.feedback = updatedPersona.learningProfile.feedback
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);
    }
  }
  
  // Update skills based on feedback
  if (feedbackData.suggestedSkills && Array.isArray(feedbackData.suggestedSkills)) {
    for (const skill of feedbackData.suggestedSkills) {
      if (!updatedPersona.skills.includes(skill)) {
        updatedPersona.skills.push(skill);
      }
    }
  }
  
  // Update last updated timestamp
  updatedPersona.lastUpdated = new Date().toISOString();
  
  return updatedPersona;
}

// Simple sentiment analysis function (real implementation would use NLP)
function calculateSentiment(text: string): number {
  const positiveWords = [
    "good", "great", "excellent", "impressive", "strong", "qualified",
    "skilled", "proficient", "experienced", "talented", "perfect",
    "ideal", "outstanding", "exceptional", "impressive"
  ];
  
  const negativeWords = [
    "lack", "insufficient", "missing", "inadequate", "weak",
    "poor", "limited", "unqualified", "inexperienced", "disappointing",
    "unfortunately", "not", "without", "concern"
  ];
  
  const textLower = text.toLowerCase();
  
  let score = 50; // Neutral starting point
  
  for (const word of positiveWords) {
    if (textLower.includes(word)) {
      score += 5;
    }
  }
  
  for (const word of negativeWords) {
    if (textLower.includes(word)) {
      score -= 5;
    }
  }
  
  return Math.min(Math.max(score, 0), 100);
}

function identifyLearningPoints(feedbackData: any): string[] {
  const learningPoints = [];
  
  if (feedbackData.suggestedSkills && feedbackData.suggestedSkills.length > 0) {
    learningPoints.push(`Skills to develop: ${feedbackData.suggestedSkills.join(", ")}`);
  }
  
  if (feedbackData.message) {
    if (feedbackData.message.toLowerCase().includes("experience")) {
      learningPoints.push("Consider gaining more relevant experience in this area");
    }
    
    if (feedbackData.message.toLowerCase().includes("communication")) {
      learningPoints.push("Focus on improving communication skills");
    }
    
    if (feedbackData.message.toLowerCase().includes("technical")) {
      learningPoints.push("Work on strengthening technical knowledge");
    }
  }
  
  if (learningPoints.length === 0) {
    learningPoints.push("Continue to develop your professional skills");
  }
  
  return learningPoints;
}
