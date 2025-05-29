
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Target, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

interface ReelStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  demo: React.ReactNode;
}

const JobPersonaReel = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const steps: ReelStep[] = [
    {
      id: 'create',
      title: 'Create Your AI Avatar',
      description: 'Build a digital version of yourself that understands your skills, experience, and career goals.',
      icon: <Brain className="h-8 w-8" />,
      color: 'from-blue-500 to-purple-600',
      demo: (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">Analyzing your profile...</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Leadership</Badge>
            <Badge variant="secondary">Node.js</Badge>
          </div>
          <Progress value={85} className="h-2" />
          <p className="text-xs text-gray-500">AI Profile: 85% Complete</p>
        </div>
      )
    },
    {
      id: 'analyze',
      title: 'Smart Job Matching',
      description: 'Your AI scans thousands of jobs and identifies the perfect matches based on your unique profile.',
      icon: <Target className="h-8 w-8" />,
      color: 'from-green-500 to-teal-600',
      demo: (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-sm font-medium">Senior React Developer</span>
              <Badge className="bg-green-500">95% Match</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-sm font-medium">Frontend Engineer</span>
              <Badge variant="outline">87% Match</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium">Full Stack Developer</span>
              <Badge variant="outline">78% Match</Badge>
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Sparkles className="h-3 w-3 mr-1" />
            Analyzed 1,247 jobs in 0.3 seconds
          </div>
        </div>
      )
    },
    {
      id: 'apply',
      title: 'Auto-Generate Applications',
      description: 'AI creates personalized cover letters and applications tailored to each specific job opening.',
      icon: <FileText className="h-8 w-8" />,
      color: 'from-orange-500 to-red-600',
      demo: (
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded text-xs">
            <p className="font-medium mb-1">Dear Hiring Manager,</p>
            <p>I am excited to apply for the Senior React Developer position. With my 5 years of experience in React and TypeScript...</p>
            <div className="flex items-center mt-2 text-gray-500">
              <Zap className="h-3 w-3 mr-1" />
              <span>Generated in 2.1 seconds</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">Application customized for TechCorp</span>
          </div>
        </div>
      )
    },
    {
      id: 'simulate',
      title: 'Interview Simulation',
      description: 'Practice with AI-powered interview simulations to prepare for real conversations with recruiters.',
      icon: <MessageSquare className="h-8 w-8" />,
      color: 'from-purple-500 to-pink-600',
      demo: (
        <div className="space-y-3">
          <div className="bg-blue-50 p-2 rounded-l-lg rounded-tr-lg text-sm">
            <p className="font-medium">AI Recruiter:</p>
            <p>"Tell me about your experience with React hooks."</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-r-lg rounded-tl-lg text-sm ml-4">
            <p className="font-medium">You:</p>
            <p>"I've been working with React hooks for 3 years..."</p>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span>AI provides real-time feedback</span>
          </div>
        </div>
      )
    },
    {
      id: 'learn',
      title: 'Continuous Learning',
      description: 'Your AI learns from feedback and improves its job matching and application success rates over time.',
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'from-indigo-500 to-blue-600',
      demo: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">73%</div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-500">Applications Sent</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            Performance improved by 23% this month
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentStep(current => (current + 1) % steps.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">JobPersona AI</h2>
                  <p className="text-white/90">Your AI-Powered Job Search Assistant</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={togglePlayPause}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Left Side - Steps Navigation */}
            <div className="p-6 bg-gray-50">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      index === currentStep ? 'scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => handleStepClick(index)}
                  >
                    <div className={`p-4 rounded-lg border-2 ${
                      index === currentStep 
                        ? 'border-primary bg-white shadow-lg' 
                        : 'border-gray-200 bg-white/50 hover:bg-white'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${step.color} text-white`}>
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                        {index === currentStep && (
                          <ArrowRight className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      {index === currentStep && (
                        <div className="mt-3">
                          <Progress value={progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Demo Area */}
            <div className="p-6 bg-white">
              <div className="h-full flex flex-col">
                <div className={`p-4 rounded-lg bg-gradient-to-r ${steps[currentStep].color} text-white mb-4`}>
                  <div className="flex items-center space-x-3">
                    {steps[currentStep].icon}
                    <h3 className="text-xl font-bold">{steps[currentStep].title}</h3>
                  </div>
                </div>

                <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                  {steps[currentStep].demo}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-gray-600 mb-4">{steps[currentStep].description}</p>
                  <Button className="w-full">
                    Get Started with JobPersona AI
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="p-4 bg-gray-100 border-t">
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-primary scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => handleStepClick(index)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobPersonaReel;
