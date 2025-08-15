import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobPersona } from '@/context/JobPersonaContext';
import { useDatabase } from '@/context/DatabaseContext';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { 
  Brain, CheckCircle2, Edit, PieChart, RefreshCcw, 
  Send, Star, XCircle, MessageSquare, FileText, 
  Briefcase, CheckCheck
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  matchScore: number;
  applied: boolean;
}

interface Message {
  role: 'user' | 'ai' | 'system';
  content: string;
}

const JobPersona = () => {
  const navigate = useNavigate();
  const { persona, isLoading, hasPersona, analyzeJobMatch, generateApplication, simulateConversation, submitApplication } = useJobPersona();
  const { jobs, loading: loadingJobs, fetchJobs } = useDatabase();
  
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);
  const [analyzingJob, setAnalyzingJob] = useState(false);

  // Application dialog state
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [generatedApplication, setGeneratedApplication] = useState('');
  const [generatingApplication, setGeneratingApplication] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  // Conversation simulator state
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [respondingToQuestion, setRespondingToQuestion] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  useEffect(() => {
    if (!hasPersona) {
      navigate('/create-job-persona');
    }
  }, [hasPersona, navigate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Get job matches when jobs are loaded
  useEffect(() => {
    const getJobMatches = async () => {
      if (!loadingJobs && jobs.length > 0 && persona) {
        setLoadingMatches(true);
        
        try {
          // Process each job to get match scores
          const matchPromises = jobs.slice(0, 10).map(async (job) => {
            try {
              // This would call the analyzeJobMatch function for each job
              // For performance reasons in this demo, we'll simulate random scores
              // In a production app, you would batch these calls or use a more efficient approach
              const matchScore = Math.floor(Math.random() * 40) + 60; // Random score for demo
              
              return {
                id: job.id.toString(), // Convert id to string to ensure type compatibility
                title: job.title,
                company: job.company,
                matchScore: matchScore,
                applied: false
              };
            } catch (error) {
              console.error(`Error analyzing job ${job.id}:`, error);
              return {
                id: job.id.toString(), // Convert id to string to ensure type compatibility
                title: job.title,
                company: job.company,
                matchScore: 50, // Default score on error
                applied: false
              };
            }
          });
          
          const matches = await Promise.all(matchPromises);
          
          // Sort by match score (highest first)
          matches.sort((a, b) => b.matchScore - a.matchScore);
          
          setJobMatches(matches as JobMatch[]);
        } catch (error) {
          console.error("Error getting job matches:", error);
          toast({
            title: "Error",
            description: "Failed to analyze job matches. Please try again.",
            variant: "destructive"
          });
        } finally {
          setLoadingMatches(false);
        }
      }
    };
    
    getJobMatches();
  }, [loadingJobs, jobs, persona]);

  const handleAnalyzeJob = async (jobId: string) => {
    setSelectedJob(jobId);
    setAnalyzingJob(true);
    
    try {
      const analysis = await analyzeJobMatch(jobId);
      setJobAnalysis(analysis);
    } catch (error) {
      console.error("Error analyzing job:", error);
      toast({
        title: "Error",
        description: "Failed to analyze job match.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingJob(false);
    }
  };

  const handleRefreshMatches = () => {
    setLoadingMatches(true);
    fetchJobs();
    
    // Get new match scores
    setTimeout(() => {
      const matches = jobs.map(job => ({
        id: job.id.toString(), // Convert id to string to ensure type compatibility
        title: job.title,
        company: job.company,
        matchScore: Math.floor(Math.random() * 40) + 60, // Random score for demo
        applied: false
      }));
      
      matches.sort((a, b) => b.matchScore - a.matchScore);
      setJobMatches(matches as JobMatch[]);
      setLoadingMatches(false);
      
      toast({
        title: "Matches Refreshed",
        description: "Your job matches have been updated."
      });
    }, 1500);
  };

  const handleGenerateApplication = async (jobId: string) => {
    if (!selectedJob) return;
    
    setGeneratingApplication(true);
    try {
      const application = await generateApplication(jobId);
      if (application) {
        setGeneratedApplication(application);
        setApplicationDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating application:", error);
      toast({
        title: "Error",
        description: "Failed to generate application.",
        variant: "destructive"
      });
    } finally {
      setGeneratingApplication(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;
    
    setSubmittingApplication(true);
    try {
      const success = await submitApplication(selectedJob, generatedApplication);
      if (success) {
        // Update the job match as applied
        setJobMatches(prev => 
          prev.map(match => 
            match.id === selectedJob 
              ? { ...match, applied: true } 
              : match
          )
        );
        
        setApplicationDialogOpen(false);
        
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully!",
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleOpenConversation = (jobId: string) => {
    setSelectedJob(jobId);
    
    // Initialize conversation with a system message
    const selectedJob = jobs.find(job => job.id === jobId);
    setConversationMessages([
      { 
        role: 'system', 
        content: `Starting a simulated conversation with a recruiter for the ${selectedJob?.title} position at ${selectedJob?.company}.` 
      },
      {
        role: 'user',
        content: 'Hello, I\'d like to discuss my application for this position.'
      }
    ]);
    
    setConversationHistory([]);
    setConversationDialogOpen(true);
  };

  const handleSendQuestion = async () => {
    if (!currentQuestion.trim() || !selectedJob) return;
    
    const newMessage: Message = { role: 'user', content: currentQuestion.trim() };
    setConversationMessages(prev => [...prev, newMessage]);
    setConversationHistory(prev => [...prev, newMessage]);
    setCurrentQuestion('');
    setRespondingToQuestion(true);
    
    try {
      const response = await simulateConversation(
        selectedJob, 
        currentQuestion.trim(),
        conversationHistory
      );
      
      if (response) {
        const aiMessage: Message = { role: 'ai', content: response };
        setConversationMessages(prev => [...prev, aiMessage]);
        setConversationHistory(prev => [...prev, { role: 'user', content: currentQuestion.trim() }, { role: 'ai', content: response }]);
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      toast({
        title: "Error",
        description: "Failed to get response.",
        variant: "destructive"
      });
    } finally {
      setRespondingToQuestion(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!persona) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold">No JobPersona Found</h2>
            <p className="mb-6">You haven't created your JobPersona AI avatar yet.</p>
            <Button onClick={() => navigate('/create-job-persona')}>
              Create JobPersona
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Your JobPersona AI</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/edit-job-persona')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
          <p className="mt-2 text-gray-600">
            Your AI-powered job hunting assistant that works on your behalf
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* JobPersona profile summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>JobPersona Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Top Skills</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {persona.skills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Experience</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {persona.experience.slice(0, 3).map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Preferences</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    {persona.preferences.jobTypes.length > 0 && (
                      <div>
                        <span className="font-medium">Job Types:</span> {persona.preferences.jobTypes.join(', ')}
                      </div>
                    )}
                    {persona.preferences.locations.length > 0 && (
                      <div>
                        <span className="font-medium">Locations:</span> {persona.preferences.locations.join(', ')}
                      </div>
                    )}
                    {(persona.preferences.salary.min > 0 || persona.preferences.salary.max > 0) && (
                      <div>
                        <span className="font-medium">Salary:</span> ${persona.preferences.salary.min.toLocaleString()} - ${persona.preferences.salary.max.toLocaleString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Remote:</span> {persona.preferences.remote ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Learning Progress</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span>Profile Completeness</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span>Learning Data</span>
                        <span>42%</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/job-persona-stats')}>
                  <PieChart className="mr-2 h-4 w-4" />
                  View Detailed Stats
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="matches">
              <div className="mb-6 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="matches">Job Matches</TabsTrigger>
                  <TabsTrigger value="applications">My Applications</TabsTrigger>
                  <TabsTrigger value="learning">Learning</TabsTrigger>
                </TabsList>
                
                <Button variant="outline" size="sm" onClick={handleRefreshMatches} disabled={loadingMatches}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh Matches
                </Button>
              </div>
              
              <TabsContent value="matches" className="mt-0">
                <div className="space-y-6">
                  {loadingMatches ? (
                    <Card>
                      <CardContent className="flex h-64 items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          <p className="mt-4 text-sm text-gray-500">Analyzing job matches...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : jobMatches.length === 0 ? (
                    <Card>
                      <CardContent className="flex h-40 items-center justify-center text-center">
                        <div>
                          <p className="text-lg font-medium">No job matches found</p>
                          <p className="mt-2 text-sm text-gray-500">
                            We couldn't find any jobs matching your profile. Try adjusting your preferences.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Best matches */}
                      <div>
                        <h2 className="mb-3 text-lg font-semibold">Best Matches</h2>
                        <div className="space-y-4">
                          {jobMatches.slice(0, 3).map((jobMatch) => (
                            <Card key={jobMatch.id} className={selectedJob === jobMatch.id ? 'border-primary' : ''}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium">{jobMatch.title}</h3>
                                    <p className="text-sm text-gray-500">{jobMatch.company}</p>
                                  </div>
                                  <Badge variant={jobMatch.matchScore >= 80 ? "default" : "outline"} className="ml-auto">
                                    {jobMatch.matchScore}% Match
                                  </Badge>
                                </div>
                                
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => handleAnalyzeJob(jobMatch.id)}
                                    disabled={analyzingJob}
                                  >
                                    {analyzingJob && selectedJob === jobMatch.id ? (
                                      <>Analyzing...</>
                                    ) : (
                                      <>Analyze Match</>
                                    )}
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleOpenConversation(jobMatch.id)}
                                  >
                                    <MessageSquare className="mr-1 h-4 w-4" />
                                    Simulate Interview
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleGenerateApplication(jobMatch.id)}
                                    disabled={generatingApplication}
                                  >
                                    <FileText className="mr-1 h-4 w-4" />
                                    Generate Application
                                  </Button>
                                  
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => navigate(`/job/${jobMatch.id}`)}
                                  >
                                    <Briefcase className="mr-1 h-4 w-4" />
                                    View Job
                                  </Button>
                                </div>
                                
                                {jobMatch.applied && (
                                  <div className="mt-3 flex items-center text-sm text-green-600">
                                    <CheckCheck className="mr-1 h-4 w-4" />
                                    Applied
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      {/* More matches */}
                      <div>
                        <h2 className="mb-3 text-lg font-semibold">More Matches</h2>
                        <Card>
                          <div className="divide-y">
                            {jobMatches.slice(3).map((jobMatch) => (
                              <div key={jobMatch.id} className="flex items-center justify-between p-4">
                                <div>
                                  <h3 className="font-medium">{jobMatch.title}</h3>
                                  <p className="text-sm text-gray-500">{jobMatch.company}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge>{jobMatch.matchScore}% Match</Badge>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => navigate(`/job/${jobMatch.id}`)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="applications" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Generated Applications</CardTitle>
                    <CardDescription>
                      Track your automated applications and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-40 items-center justify-center text-center">
                      <div>
                        <p className="text-lg font-medium">No applications yet</p>
                        <p className="mt-2 text-sm text-gray-500">
                          Your AI hasn't sent any applications yet. Analyze job matches to get started.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="learning" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardDescription>
                      See how your JobPersona AI is learning and improving
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-2 text-sm font-medium">Feedback Learning</h3>
                        <Progress value={persona.learningProfile.feedback.length * 5} className="h-2" />
                        <p className="mt-1 text-xs text-gray-500">
                          {persona.learningProfile.feedback.length} feedback items collected
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="mb-2 text-sm font-medium">Application History</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border bg-card p-3 text-center">
                            <p className="text-2xl font-bold text-primary">
                              {persona.learningProfile.successfulApplications.length}
                            </p>
                            <p className="text-xs text-gray-500">Successful</p>
                          </div>
                          <div className="rounded-lg border bg-card p-3 text-center">
                            <p className="text-2xl font-bold text-muted-foreground">
                              {persona.learningProfile.rejectedApplications.length}
                            </p>
                            <p className="text-xs text-gray-500">Learning Opportunities</p>
                          </div>
                        </div>
                      </div>
                      
                      {persona.learningProfile.feedback.length > 0 && (
                        <div>
                          <h3 className="mb-2 text-sm font-medium">Recent Feedback</h3>
                          <div className="max-h-40 overflow-y-auto rounded-md border p-3">
                            {persona.learningProfile.feedback
                              .slice(0, 3)
                              .map((feedback, i) => (
                                <div key={i} className="mb-2 border-b pb-2 last:border-0 last:pb-0">
                                  <p className="text-sm">{feedback.message}</p>
                                  <div className="mt-1 flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      Sentiment: {feedback.sentimentScore}%
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {new Date(feedback.timestamp || '').toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Job analysis section */}
            {selectedJob && jobAnalysis && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Job Match Analysis</CardTitle>
                  <CardDescription>
                    Detailed analysis of how well your profile matches this job
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-20 w-20">
                      <div className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-primary">
                        <span className="text-lg font-bold">{jobAnalysis.score}%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {jobAnalysis.score >= 80 ? 'Excellent Match' : jobAnalysis.score >= 60 ? 'Good Match' : 'Fair Match'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {jobAnalysis.recommendation}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-2 flex items-center font-medium">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Strengths
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {jobAnalysis.strengths.map((strength: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <Star className="mr-2 h-4 w-4 text-amber-500" /> 
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="mb-2 flex items-center font-medium">
                        <XCircle className="mr-2 h-5 w-5 text-red-500" /> Areas to Address
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {jobAnalysis.weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2 text-gray-400">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button onClick={() => handleGenerateApplication(selectedJob)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Application
                  </Button>
                  
                  <Button variant="outline" onClick={() => handleOpenConversation(selectedJob)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Simulate Interview
                  </Button>
                  
                  <Button variant="secondary" onClick={() => navigate(`/job/${selectedJob}`)}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    View Full Job Details
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Generated Application Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Application</DialogTitle>
            <DialogDescription>
              Review and edit your AI-generated application before submitting
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Textarea 
              className="h-[300px] font-mono"
              value={generatedApplication}
              onChange={(e) => setGeneratedApplication(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplicationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitApplication}
              disabled={submittingApplication}
            >
              {submittingApplication ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Conversation Simulator Dialog */}
      <Dialog open={conversationDialogOpen} onOpenChange={setConversationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulated Interview</DialogTitle>
            <DialogDescription>
              Practice your interview skills with an AI recruiter
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 h-[300px] overflow-y-auto rounded-md border p-4">
            {conversationMessages.map((message, index) => (
              message.role !== 'system' && (
                <div 
                  key={index} 
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              )
            ))}
            
            {respondingToQuestion && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Textarea
              placeholder="Ask a question..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendQuestion();
                }
              }}
              disabled={respondingToQuestion}
              className="flex-1"
            />
            <Button 
              size="icon"
              onClick={handleSendQuestion}
              disabled={!currentQuestion.trim() || respondingToQuestion}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobPersona;
