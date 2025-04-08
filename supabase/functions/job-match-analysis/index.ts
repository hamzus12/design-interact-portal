
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
    const { jobData, personaData } = await req.json();

    if (!jobData || !personaData) {
      throw new Error("Missing required data");
    }

    console.log("Job match analysis request received:", { 
      jobTitle: jobData.title,
      skills: personaData.skills?.length || 0 
    });

    // Extract job requirements and candidate skills
    const jobRequirements = extractRequirements(jobData.description);
    const candidateSkills = personaData.skills || [];
    const candidateExperience = personaData.experience || [];
    
    // Calculate match score
    const skillsMatch = calculateSkillsMatch(jobRequirements.skills, candidateSkills);
    const experienceMatch = calculateExperienceMatch(
      jobRequirements.experienceYears, 
      candidateExperience
    );
    const locationMatch = calculateLocationMatch(
      jobData.location,
      personaData.preferences?.locations || []
    );
    const salaryMatch = calculateSalaryMatch(
      jobData.salary_range,
      personaData.preferences?.salary
    );
    
    // Calculate weighted score
    const score = Math.round(
      (skillsMatch * 0.5) + 
      (experienceMatch * 0.3) + 
      (locationMatch * 0.1) + 
      (salaryMatch * 0.1)
    );
    
    // Identify strengths and weaknesses
    const strengths = identifyStrengths(jobRequirements, personaData);
    const weaknesses = identifyWeaknesses(jobRequirements, personaData);
    
    // Generate recommendation
    const recommendation = generateRecommendation(score, strengths.length, weaknesses.length);

    return new Response(
      JSON.stringify({
        score,
        strengths,
        weaknesses,
        recommendation,
        detailedAnalysis: {
          skillsMatch,
          experienceMatch,
          locationMatch,
          salaryMatch
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in job match analysis:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during analysis" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions for match analysis
function extractRequirements(description: string) {
  // In a real implementation, this would use NLP techniques
  // For now, simulate extraction of key requirements
  const commonSkills = [
    "javascript", "typescript", "react", "angular", "vue", "node", "python", 
    "java", "c#", "php", "ruby", "go", "rust", "sql", "nosql", "mongodb",
    "postgresql", "mysql", "aws", "azure", "gcp", "docker", "kubernetes",
    "ci/cd", "agile", "scrum", "kanban", "leadership", "communication",
    "teamwork", "problem-solving", "critical-thinking"
  ];
  
  const skills = [];
  const descriptionLower = description.toLowerCase();
  
  for (const skill of commonSkills) {
    if (descriptionLower.includes(skill)) {
      skills.push(skill);
    }
  }
  
  // Naive extraction of years of experience
  const experienceRegex = /(\d+)\+?\s*years?(?:\s*of)?\s*experience/i;
  const experienceMatch = descriptionLower.match(experienceRegex);
  const experienceYears = experienceMatch ? parseInt(experienceMatch[1], 10) : 0;
  
  return { skills, experienceYears };
}

function calculateSkillsMatch(requiredSkills: string[], candidateSkills: string[]) {
  if (!requiredSkills.length) return 100;
  
  const candidateSkillsLower = candidateSkills.map(skill => skill.toLowerCase());
  let matchingSkills = 0;
  
  for (const skill of requiredSkills) {
    if (candidateSkillsLower.some(candidateSkill => candidateSkill.includes(skill) || skill.includes(candidateSkill))) {
      matchingSkills++;
    }
  }
  
  return Math.round((matchingSkills / requiredSkills.length) * 100);
}

function calculateExperienceMatch(requiredYears: number, candidateExperience: string[]) {
  if (requiredYears === 0) return 100;
  
  // Simple estimation of candidate's years of experience
  let estimatedYears = 0;
  for (const exp of candidateExperience) {
    // Look for patterns like "2018-2021" or "2 years"
    const yearRangeMatch = exp.match(/(\d{4})[^\d]+(\d{4})/);
    if (yearRangeMatch) {
      estimatedYears += parseInt(yearRangeMatch[2]) - parseInt(yearRangeMatch[1]);
      continue;
    }
    
    const yearsMatch = exp.match(/(\d+)\s+years?/i);
    if (yearsMatch) {
      estimatedYears += parseInt(yearsMatch[1]);
      continue;
    }
    
    // If no clear pattern, assume 1 year per experience entry
    estimatedYears += 1;
  }
  
  // Calculate match percentage
  const matchPercentage = Math.min(100, Math.round((estimatedYears / requiredYears) * 100));
  return matchPercentage;
}

function calculateLocationMatch(jobLocation: string, preferredLocations: string[]) {
  if (!preferredLocations.length) return 50; // Neutral if no preferences
  
  const jobLocationLower = jobLocation.toLowerCase();
  
  for (const location of preferredLocations) {
    const locationLower = location.toLowerCase();
    if (jobLocationLower.includes(locationLower) || locationLower.includes(jobLocationLower)) {
      return 100;
    }
  }
  
  // Check for remote preferences
  if ((jobLocationLower.includes('remote') && preferredLocations.some(loc => loc.toLowerCase().includes('remote')))) {
    return 100;
  }
  
  return 30; // Low match if location doesn't match preferred locations
}

function calculateSalaryMatch(salaryRange: string, preferredSalary: { min: number, max: number } | undefined) {
  if (!preferredSalary || (preferredSalary.min === 0 && preferredSalary.max === 0)) {
    return 50; // Neutral if no salary preference
  }
  
  if (!salaryRange) return 50;
  
  // Extract salary range from string like "$50,000 - $80,000"
  const salaryMatches = salaryRange.match(/(\d[\d,]*)/g);
  if (!salaryMatches || salaryMatches.length < 2) return 50;
  
  const jobMin = parseInt(salaryMatches[0].replace(/,/g, ''), 10);
  const jobMax = parseInt(salaryMatches[1].replace(/,/g, ''), 10);
  
  // Check if ranges overlap
  const maxMin = Math.max(jobMin, preferredSalary.min);
  const minMax = Math.min(jobMax, preferredSalary.max);
  
  if (maxMin <= minMax) {
    // Ranges overlap
    const overlapSize = minMax - maxMin;
    const preferredRange = preferredSalary.max - preferredSalary.min;
    
    return Math.round((overlapSize / preferredRange) * 100);
  }
  
  // No overlap, but check how far apart they are
  const gap = preferredSalary.min > jobMax ? 
    preferredSalary.min - jobMax : 
    jobMin - preferredSalary.max;
  
  const preferredMid = (preferredSalary.min + preferredSalary.max) / 2;
  const gapPercentage = Math.min(100, Math.round((gap / preferredMid) * 100));
  
  return Math.max(0, 50 - gapPercentage);
}

function identifyStrengths(jobRequirements: { skills: string[], experienceYears: number }, personaData: any) {
  const strengths = [];
  const candidateSkills = (personaData.skills || []).map(s => s.toLowerCase());
  
  // Check skill matches
  const matchingSkills = jobRequirements.skills.filter(skill => 
    candidateSkills.some(candidateSkill => 
      candidateSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(candidateSkill)
    )
  );
  
  if (matchingSkills.length > 0) {
    if (matchingSkills.length === jobRequirements.skills.length) {
      strengths.push("All required skills match");
    } else if (matchingSkills.length >= jobRequirements.skills.length * 0.7) {
      strengths.push("Strong skills match");
    } else if (matchingSkills.length >= jobRequirements.skills.length * 0.5) {
      strengths.push("Good skills match");
    } else {
      strengths.push(`Matching skills: ${matchingSkills.join(", ")}`);
    }
  }
  
  // Experience match
  const experienceYears = calculateCandidateExperienceYears(personaData.experience || []);
  if (experienceYears >= jobRequirements.experienceYears) {
    strengths.push(`${experienceYears} years of experience (exceeds ${jobRequirements.experienceYears} years required)`);
  }
  
  // Location match
  if (personaData.preferences?.locations?.some(loc => 
    loc.toLowerCase().includes(personaData.location?.toLowerCase()) || 
    personaData.location?.toLowerCase().includes(loc.toLowerCase())
  )) {
    strengths.push("Location preference match");
  }
  
  return strengths;
}

function identifyWeaknesses(jobRequirements: { skills: string[], experienceYears: number }, personaData: any) {
  const weaknesses = [];
  const candidateSkills = (personaData.skills || []).map(s => s.toLowerCase());
  
  // Check missing skills
  const missingSkills = jobRequirements.skills.filter(skill => 
    !candidateSkills.some(candidateSkill => 
      candidateSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(candidateSkill)
    )
  );
  
  if (missingSkills.length > 0) {
    weaknesses.push(`Missing skills: ${missingSkills.join(", ")}`);
  }
  
  // Experience gap
  const experienceYears = calculateCandidateExperienceYears(personaData.experience || []);
  if (experienceYears < jobRequirements.experienceYears) {
    weaknesses.push(`Experience gap: ${jobRequirements.experienceYears - experienceYears} more years of experience required`);
  }
  
  // Salary mismatch
  if (personaData.preferences?.salary?.min > 0 || personaData.preferences?.salary?.max > 0) {
    weaknesses.push("Salary expectations may not align with job offer");
  }
  
  return weaknesses.length > 0 ? weaknesses : ["No significant weaknesses identified"];
}

function calculateCandidateExperienceYears(experience: string[]) {
  let totalYears = 0;
  
  for (const exp of experience) {
    const yearRangeMatch = exp.match(/(\d{4})[^\d]+(\d{4})/);
    if (yearRangeMatch) {
      totalYears += parseInt(yearRangeMatch[2]) - parseInt(yearRangeMatch[1]);
      continue;
    }
    
    const yearsMatch = exp.match(/(\d+)\s+years?/i);
    if (yearsMatch) {
      totalYears += parseInt(yearsMatch[1]);
      continue;
    }
    
    totalYears += 1;  // Default 1 year per experience entry
  }
  
  return totalYears;
}

function generateRecommendation(score: number, strengthsCount: number, weaknessesCount: number) {
  if (score >= 90) {
    return "This job is an excellent match for your profile. Consider applying immediately with a customized application to highlight your relevant experience.";
  } else if (score >= 75) {
    return "This job is a good match for your profile. Apply with a strong cover letter highlighting your relevant skills and experience.";
  } else if (score >= 60) {
    return "This job is a fair match. Consider addressing the identified weaknesses in your application and emphasize your strengths.";
  } else {
    return "This job may not be an ideal match for your profile. Consider improving your skills in the areas mentioned before applying.";
  }
}
