
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useJobPersona } from '@/context/JobPersonaContext';
import { 
  ArrowLeft, Brain, TrendingUp, Target, Clock, 
  CheckCircle2, XCircle, Star, BarChart3, PieChart,
  Calendar, Users, Briefcase, Award
} from 'lucide-react';

const JobPersonaStats = () => {
  const navigate = useNavigate();
  const { persona, isLoading } = useJobPersona();

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

  // Calculate some mock statistics for demonstration
  const totalApplications = persona.learningProfile?.successfulApplications.length || 0;
  const totalRejections = persona.learningProfile?.rejectedApplications.length || 0;
  const successRate = totalApplications + totalRejections > 0 
    ? Math.round((totalApplications / (totalApplications + totalRejections)) * 100) 
    : 0;
  
  const avgResponseTime = "2.3 days";
  const profileCompleteness = 85;
  const learningProgress = 42;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/job-persona')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">JobPersona Detailed Statistics</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Overview Cards */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                    </div>
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Applications</p>
                      <p className="text-2xl font-bold">{totalApplications}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                      <p className="text-2xl font-bold">{avgResponseTime}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Skills Analyzed</p>
                      <p className="text-2xl font-bold">{persona.skills.length}</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Profile Analysis */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 h-5 w-5" />
                Profile Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Completeness</span>
                  <span className="text-sm text-gray-500">{profileCompleteness}%</span>
                </div>
                <Progress value={profileCompleteness} className="h-3" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Learning Data Collection</span>
                  <span className="text-sm text-gray-500">{learningProgress}%</span>
                </div>
                <Progress value={learningProgress} className="h-3" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Skills Match Accuracy</span>
                  <span className="text-sm text-gray-500">78%</span>
                </div>
                <Progress value={78} className="h-3" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Preference Alignment</span>
                  <span className="text-sm text-gray-500">92%</span>
                </div>
                <Progress value={92} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Skills Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Top Skills Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {persona.skills.slice(0, 5).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill}</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-16 rounded-full bg-gray-200">
                        <div 
                          className="h-2 rounded-full bg-primary" 
                          style={{ width: `${Math.random() * 60 + 40}%` }}
                        />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(Math.random() * 20 + 80)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Application History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Application Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-green-600">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Successful Applications
                  </h3>
                  {totalApplications > 0 ? (
                    <div className="space-y-2">
                      {persona.learningProfile?.successfulApplications.slice(0, 3).map((appId, index) => (
                        <div key={index} className="rounded-lg border bg-green-50 p-3">
                          <p className="text-sm font-medium">Application #{appId.slice(-6)}</p>
                          <p className="text-xs text-gray-500">Status: Accepted</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No successful applications yet</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-red-600">
                    <XCircle className="mr-2 h-5 w-5" />
                    Learning Opportunities
                  </h3>
                  {totalRejections > 0 ? (
                    <div className="space-y-2">
                      {persona.learningProfile?.rejectedApplications.slice(0, 3).map((appId, index) => (
                        <div key={index} className="rounded-lg border bg-red-50 p-3">
                          <p className="text-sm font-medium">Application #{appId.slice(-6)}</p>
                          <p className="text-xs text-gray-500">Status: Under Review</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No rejections recorded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Feedback Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {persona.learningProfile?.feedback && persona.learningProfile.feedback.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="font-medium text-blue-900">Average Sentiment Score</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        persona.learningProfile.feedback.reduce((acc, f) => acc + f.sentimentScore, 0) / 
                        persona.learningProfile.feedback.length
                      )}%
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="mb-2 font-medium">Recent Feedback Trends</h4>
                    <div className="space-y-2">
                      {persona.learningProfile.feedback.slice(0, 3).map((feedback, index) => (
                        <div key={index} className="rounded border bg-gray-50 p-2">
                          <p className="text-xs text-gray-600">{feedback.message}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {feedback.sentimentScore}% positive
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(feedback.timestamp || '').toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No feedback collected yet. Start applying to jobs to gather insights!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences Summary */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Job Preferences & Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-3 font-medium">Job Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.preferences.jobTypes.map((type, index) => (
                      <Badge key={index} variant="secondary">{type}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-medium">Preferred Locations</h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.preferences.locations.map((location, index) => (
                      <Badge key={index} variant="secondary">{location}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-medium">Salary Range</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Min:</span> ${persona.preferences.salary.min.toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Max:</span> ${persona.preferences.salary.max.toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Remote:</span> {persona.preferences.remote ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button onClick={() => navigate('/job-persona')} variant="default">
            Back to JobPersona Dashboard
          </Button>
          <Button onClick={() => navigate('/edit-job-persona')} variant="outline">
            Edit Preferences
          </Button>
          <Button onClick={() => navigate('/jobs')} variant="outline">
            Browse Jobs
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default JobPersonaStats;
