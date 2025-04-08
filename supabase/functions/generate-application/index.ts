
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { jobData, personaData, applicationType } = await req.json();

    if (!jobData || !personaData) {
      throw new Error("Missing required data");
    }

    console.log("Application generation request received:", { 
      jobTitle: jobData.title,
      applicationType: applicationType || "cover_letter"
    });
    
    let generatedContent = "";
    
    switch (applicationType) {
      case "cover_letter":
        generatedContent = generateCoverLetter(jobData, personaData);
        break;
      case "email":
        generatedContent = generateEmail(jobData, personaData);
        break;
      case "follow_up":
        generatedContent = generateFollowUp(jobData, personaData);
        break;
      default:
        generatedContent = generateCoverLetter(jobData, personaData);
    }

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating application:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during generation" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCoverLetter(jobData: any, personaData: any) {
  const { title, company } = jobData;
  const { skills = [], experience = [] } = personaData;
  
  const topSkills = skills.slice(0, 3).join(", ");
  const mostRecentExperience = experience[0] || "relevant experience";
  
  return `Dear Hiring Manager,

I am writing to express my interest in the ${title} position at ${company}. With my background in ${topSkills}, I believe I would be a valuable addition to your team.

${generateExperienceParagraph(experience, title)}

${generateSkillsParagraph(skills, jobData.description)}

${generateClosingParagraph(company)}

Sincerely,
[Your Name]`;
}

function generateEmail(jobData: any, personaData: any) {
  const { title, company } = jobData;
  
  return `Subject: Application for ${title} Position at ${company}

Dear Hiring Manager,

I hope this email finds you well. I am reaching out to apply for the ${title} position at ${company} that I found on your careers page.

Please find attached my resume and cover letter for your consideration. I am excited about the opportunity to contribute to ${company} and would welcome the chance to discuss how my skills and experience align with your needs.

Thank you for considering my application. I look forward to the possibility of speaking with you soon.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`;
}

function generateFollowUp(jobData: any, personaData: any) {
  const { title, company } = jobData;
  
  return `Subject: Following Up on ${title} Application at ${company}

Dear Hiring Manager,

I hope this email finds you well. I recently submitted my application for the ${title} position at ${company} and wanted to follow up to express my continued interest in the role.

I remain very excited about the opportunity to contribute to your team and am confident that my skills and experience would be a great fit for this position. If you need any additional information from me, please don't hesitate to ask.

Thank you for considering my application. I look forward to the possibility of discussing my qualifications with you further.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`;
}

function generateExperienceParagraph(experience: string[], jobTitle: string) {
  if (!experience.length) {
    return `Throughout my career, I have developed skills that I believe would transfer well to the ${jobTitle} role.`;
  }
  
  const recentExperience = experience[0];
  return `Most recently, ${recentExperience}. This experience has prepared me well for the ${jobTitle} role, as I have developed strong skills in problem-solving, collaboration, and delivering high-quality results.`;
}

function generateSkillsParagraph(skills: string[], jobDescription: string) {
  if (!skills.length) {
    return "I am particularly skilled in adapting to new environments and learning new technologies quickly.";
  }
  
  // Identify most relevant skills based on job description
  const relevantSkills = skills.filter(skill => 
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  );
  
  const skillsToHighlight = relevantSkills.length > 0 ? 
    relevantSkills.slice(0, 3) : 
    skills.slice(0, 3);
  
  return `I am particularly skilled in ${skillsToHighlight.join(", ")}, which I understand are key requirements for this position. Throughout my career, I have consistently applied these skills to deliver impactful results.`;
}

function generateClosingParagraph(company: string) {
  return `I am excited about the opportunity to bring my unique skills and experiences to ${company} and help contribute to your continued success. I am confident that my background makes me well-suited for this position, and I am eager to discuss how I can make an immediate impact on your team.`;
}
