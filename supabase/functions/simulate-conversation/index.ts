
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
    const { jobData, personaData, question, conversationHistory = [] } = await req.json();

    if (!jobData || !personaData || !question) {
      throw new Error("Missing required data");
    }

    console.log("Conversation simulation request received:", { 
      jobTitle: jobData.title,
      question: question.substring(0, 50) + (question.length > 50 ? '...' : '')
    });

    // Generate response based on the question type
    const response = generateResponse(question, jobData, personaData, conversationHistory);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in conversation simulation:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during conversation simulation" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateResponse(
  question: string, 
  jobData: any, 
  personaData: any, 
  conversationHistory: Array<{ role: string, content: string }>
) {
  const questionLower = question.toLowerCase();
  
  // Check for common question types
  if (containsAny(questionLower, ["experience", "background", "worked", "previous"])) {
    return generateExperienceResponse(personaData);
  }
  
  if (containsAny(questionLower, ["skill", "technology", "proficient", "familiar"])) {
    return generateSkillsResponse(personaData, jobData);
  }
  
  if (containsAny(questionLower, ["salary", "compensation", "pay", "package", "benefits"])) {
    return generateSalaryResponse(personaData);
  }
  
  if (containsAny(questionLower, ["weakness", "challenge", "difficult", "struggle"])) {
    return generateWeaknessResponse();
  }
  
  if (containsAny(questionLower, ["strength", "good at", "excel"])) {
    return generateStrengthResponse(personaData);
  }
  
  if (containsAny(questionLower, ["why", "reason", "interested", "apply"])) {
    return generateWhyInterestedResponse(jobData);
  }
  
  if (containsAny(questionLower, ["team", "collaborate", "work with others"])) {
    return generateTeamworkResponse();
  }
  
  if (containsAny(questionLower, ["project", "achievement", "proud"])) {
    return generateProjectResponse();
  }
  
  if (containsAny(questionLower, ["start", "available", "notice period"])) {
    return generateAvailabilityResponse();
  }
  
  if (containsAny(questionLower, ["question", "ask", "anything"])) {
    return generateCandidateQuestionResponse(jobData);
  }
  
  // Default response for unrecognized questions
  return `That's a great question. Based on my experience and skills, I would say that ${generateGenericResponse(jobData, personaData)}. I'm always focused on continuous learning and growth in my career.`;
}

function containsAny(text: string, keywords: string[]) {
  return keywords.some(keyword => text.includes(keyword));
}

function generateExperienceResponse(personaData: any) {
  const { experience = [] } = personaData;
  
  if (!experience.length) {
    return "I have been developing my skills through various projects and self-study. While I may not have extensive formal experience, I am a quick learner and am confident in my ability to contribute effectively.";
  }
  
  const recentExperiences = experience.slice(0, 2);
  
  return `My most recent experience includes ${recentExperiences.join(" Prior to that, ")}. Throughout these roles, I've developed strong skills in problem-solving, collaboration, and delivering results. I believe these experiences have prepared me well for this position.`;
}

function generateSkillsResponse(personaData: any, jobData: any) {
  const { skills = [] } = personaData;
  const jobDescription = jobData.description || "";
  
  if (!skills.length) {
    return "I have a diverse skill set that includes technical and soft skills. I'm particularly good at adapting to new environments and technologies quickly.";
  }
  
  // Find skills mentioned in the job description
  const relevantSkills = skills.filter(skill => 
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  );
  
  const skillsToHighlight = relevantSkills.length > 0 ? 
    relevantSkills.slice(0, 3) : 
    skills.slice(0, 3);
  
  return `My core technical skills include ${skillsToHighlight.join(", ")}. I've applied these skills in various projects and roles to deliver impactful results. I'm also constantly learning and adding to my skill set.`;
}

function generateSalaryResponse(personaData: any) {
  const salary = personaData.preferences?.salary || {};
  const min = salary.min || 0;
  const max = salary.max || 0;
  
  if (min === 0 && max === 0) {
    return "I'm more focused on finding the right opportunity where I can contribute and grow. I'm flexible regarding compensation and would be happy to discuss what you have in mind for this role.";
  }
  
  return `Based on my experience and skills, I'm looking for a salary in the range of $${min.toLocaleString()} to $${max.toLocaleString()}. However, I'm also considering the entire compensation package including benefits and growth opportunities.`;
}

function generateWeaknessResponse() {
  const weaknesses = [
    "One area I'm actively working on improving is my public speaking skills. I've been taking opportunities to present at team meetings to build my confidence.",
    "I sometimes tend to focus too much on details, which can impact my efficiency. I've been working on better prioritization and time management to address this.",
    "In the past, I found it difficult to delegate tasks. I've been working on building trust in team environments and have improved significantly in this area."
  ];
  
  return weaknesses[Math.floor(Math.random() * weaknesses.length)];
}

function generateStrengthResponse(personaData: any) {
  const { skills = [] } = personaData;
  
  const strengths = [
    `My greatest strength is my ability to ${skills.length > 0 ? `apply my knowledge of ${skills[0]} to solve complex problems` : 'quickly learn and adapt to new technologies and situations'}.`,
    "I excel at collaborating with cross-functional teams to deliver projects on time and within scope.",
    "My analytical thinking and attention to detail allow me to identify and solve problems efficiently.",
    "I'm particularly good at communicating complex technical concepts to non-technical stakeholders."
  ];
  
  return strengths[Math.floor(Math.random() * strengths.length)];
}

function generateWhyInterestedResponse(jobData: any) {
  const { title, company, description } = jobData;
  
  return `I'm particularly interested in the ${title} role at ${company} because it aligns perfectly with my career goals and skills. I'm impressed by ${company}'s reputation in the industry and the impact you're making. The opportunity to work on challenging projects while continuing to grow professionally is very appealing to me.`;
}

function generateTeamworkResponse() {
  return "I thrive in collaborative environments. In my previous roles, I've worked with cross-functional teams to deliver projects successfully. I value diverse perspectives and believe the best solutions come from combining different viewpoints. I'm comfortable both leading initiatives when needed and supporting team members to achieve our shared goals.";
}

function generateProjectResponse() {
  return "One project I'm particularly proud of involved developing a new system that improved efficiency by 30%. I led a team of five people, overcoming significant technical challenges and tight deadlines. The project was delivered on time and received excellent feedback from stakeholders. This experience taught me valuable lessons about project management, problem-solving, and effective communication.";
}

function generateAvailabilityResponse() {
  return "I could be available to start within two to three weeks after receiving an offer. I'm committed to ensuring a smooth transition from my current responsibilities and am excited about the possibility of joining your team soon.";
}

function generateCandidateQuestionResponse(jobData: any) {
  const { company } = jobData;
  
  const questions = [
    `Could you tell me more about the team I would be working with at ${company}?`,
    "What would success look like in this role during the first 90 days?",
    `How would you describe the company culture at ${company}?`,
    "What are the biggest challenges facing the team right now?",
    "Could you share more about the growth opportunities for this position?"
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateGenericResponse(jobData: any, personaData: any) {
  const { title, company } = jobData;
  const { skills = [] } = personaData;
  
  const responses = [
    `my experience with ${skills.length > 0 ? skills[0] : 'relevant technologies'} would be valuable for this ${title} position`,
    `I'm passionate about the work ${company} is doing in the industry`,
    "I approach challenges methodically and focus on delivering high-quality results",
    "I value continuous learning and always strive to improve my skills and knowledge"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
