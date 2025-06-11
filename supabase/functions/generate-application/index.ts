
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
      throw new Error("Données manquantes");
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
      JSON.stringify({ error: error.message || "Une erreur s'est produite lors de la génération" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCoverLetter(jobData: any, personaData: any) {
  const { title, company, description, location } = jobData;
  const { skills = [], experience = [], preferences = {} } = personaData;
  
  const topSkills = skills.slice(0, 3).join(", ");
  const mostRecentExperience = experience[0] || "une expérience pertinente";
  
  // Enhanced French cover letter generation
  return `Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste de ${title} au sein de ${company}.

${generateExperienceParagraph(experience, title, description)}

${generateSkillsParagraph(skills, description)}

${generateMotivationParagraph(company, title, preferences, location)}

${generateClosingParagraph(company)}

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Votre Nom]`;
}

function generateEmail(jobData: any, personaData: any) {
  const { title, company } = jobData;
  
  return `Objet : Candidature pour le poste de ${title} chez ${company}

Madame, Monsieur,

J'espère que ce message vous trouve en bonne santé. Je vous contacte pour postuler au poste de ${title} chez ${company} que j'ai découvert sur votre site carrières.

Veuillez trouver ci-joint mon CV et ma lettre de motivation pour votre considération. Je suis très enthousiaste à l'idée de contribuer à ${company} et serais ravi de discuter de la manière dont mes compétences et mon expérience correspondent à vos besoins.

Je vous remercie de l'attention que vous porterez à ma candidature et j'espère avoir l'opportunité de vous rencontrer prochainement.

Cordialement,
[Votre Nom]
[Votre Téléphone]
[Votre Email]`;
}

function generateFollowUp(jobData: any, personaData: any) {
  const { title, company } = jobData;
  
  return `Objet : Suivi de ma candidature pour le poste de ${title} chez ${company}

Madame, Monsieur,

J'espère que ce message vous trouve en bonne santé. J'ai récemment soumis ma candidature pour le poste de ${title} chez ${company} et souhaitais faire un suivi pour exprimer mon intérêt continu pour ce rôle.

Je reste très enthousiaste à l'idée de rejoindre votre équipe et suis convaincu que mes compétences et mon expérience seraient un excellent ajout à ce poste. Si vous avez besoin d'informations supplémentaires de ma part, n'hésitez pas à me le faire savoir.

Je vous remercie de l'attention portée à ma candidature et j'espère avoir l'opportunité de discuter davantage de mes qualifications avec vous.

Cordialement,
[Votre Nom]
[Votre Téléphone]
[Votre Email]`;
}

function generateExperienceParagraph(experience: string[], jobTitle: string, jobDescription: string) {
  if (!experience.length) {
    return `Au cours de ma carrière, j'ai développé des compétences qui, je pense, se transfereraient bien au rôle de ${jobTitle}.`;
  }
  
  const recentExperience = experience[0];
  return `Plus récemment, ${recentExperience}. Cette expérience m'a bien préparé pour le rôle de ${jobTitle}, car j'ai développé de solides compétences en résolution de problèmes, collaboration et livraison de résultats de haute qualité.`;
}

function generateSkillsParagraph(skills: string[], jobDescription: string) {
  if (!skills.length) {
    return "Je suis particulièrement doué pour m'adapter à de nouveaux environnements et apprendre rapidement de nouvelles technologies.";
  }
  
  // Identify most relevant skills based on job description
  const relevantSkills = skills.filter(skill => 
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  );
  
  const skillsToHighlight = relevantSkills.length > 0 ? 
    relevantSkills.slice(0, 3) : 
    skills.slice(0, 3);
  
  return `Je maîtrise particulièrement ${skillsToHighlight.join(", ")}, compétences que je comprends être essentielles pour ce poste. Tout au long de ma carrière, j'ai constamment appliqué ces compétences pour obtenir des résultats impactants.`;
}

function generateMotivationParagraph(company: string, jobTitle: string, preferences: any, location: string) {
  let motivation = `Ce qui m'attire particulièrement chez ${company}, c'est `;
  
  // Add motivation based on preferences
  if (preferences.remote && location.toLowerCase().includes('remote')) {
    motivation += "votre approche flexible du travail qui permet l'équilibre vie professionnelle-vie privée. ";
  } else {
    motivation += "votre réputation d'excellence et d'innovation dans le secteur. ";
  }
  
  motivation += `Le poste de ${jobTitle} représente une opportunité parfaite pour moi de contribuer à vos objectifs tout en développant mes compétences professionnelles.`;
  
  return motivation;
}

function generateClosingParagraph(company: string) {
  return `Je suis enthousiaste à l'idée d'apporter mes compétences uniques et mes expériences à ${company} et d'aider à contribuer à votre succès continu. Je suis convaincu que mon profil me rend bien adapté à ce poste, et j'ai hâte de discuter de la façon dont je peux avoir un impact immédiat sur votre équipe.`;
}
