
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LoadingButton } from '@/components/ui/loading-button';
import { Separator } from '@/components/ui/separator';
import { useJobPersona } from '@/context/JobPersonaContext';
import { toast } from '@/components/ui/use-toast';
import { Brain, CheckCircle, Cpu } from 'lucide-react';

const CreateJobPersona = () => {
  const { createPersona, isCreating } = useJobPersona();
  const navigate = useNavigate();

  // Form state
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [jobTypes, setJobTypes] = useState('');
  const [locations, setLocations] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [remote, setRemote] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!skills || !experience) {
        toast({
          title: "Missing Information",
          description: "Please fill in your skills and experience.",
          variant: "destructive"
        });
        return;
      }
      
      // Create the persona
      const success = await createPersona({
        skills: skills.split(',').map(s => s.trim()),
        experience: experience.split('\n').filter(e => e.trim()),
        preferences: {
          jobTypes: jobTypes.split(',').map(t => t.trim()),
          locations: locations.split(',').map(l => l.trim()),
          salary: {
            min: parseInt(minSalary || '0'),
            max: parseInt(maxSalary || '0'),
          },
          remote
        }
      });
      
      if (success) {
        navigate('/job-persona');
      }
    } catch (error) {
      console.error("Error creating job persona:", error);
      toast({
        title: "Error",
        description: "Something went wrong while creating your JobPersona.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Create Your JobPersona AI</h1>
          <p className="mt-2 text-gray-600">
            Let our AI system create a digital avatar that will help you find and apply to the perfect jobs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Info cards column */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>What is JobPersona?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  JobPersona is your AI-powered digital avatar that works on your behalf to find, analyze, and apply to jobs that match your skills and preferences.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Analyzes job listings for the best matches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Creates personalized applications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Simulates conversations with recruiters</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Learns and improves from feedback</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  <CardTitle>How It Works</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">1</div>
                    <div>
                      <strong>Create your JobPersona</strong>
                      <p className="mt-1">Enter your skills, experience, and job preferences.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">2</div>
                    <div>
                      <strong>Analyze job matches</strong>
                      <p className="mt-1">The AI evaluates job listings to find the best matches for you.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">3</div>
                    <div>
                      <strong>Apply automatically</strong>
                      <p className="mt-1">Generate personalized applications for the jobs you like.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">4</div>
                    <div>
                      <strong>Learn and improve</strong>
                      <p className="mt-1">Your AI avatar learns from feedback and gets better over time.</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Form column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Your JobPersona Profile</CardTitle>
                <CardDescription>
                  Fill in the information below to create your AI avatar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="skills" className="mb-1 block">Skills (comma separated)</Label>
                      <Input
                        id="skills"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="JavaScript, React, TypeScript, Project Management, etc."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience" className="mb-1 block">Professional Experience (one per line)</Label>
                      <Textarea
                        id="experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Software Engineer at Company XYZ (2020-2023)&#10;Web Developer at ABC Inc. (2018-2020)"
                        rows={4}
                        required
                      />
                    </div>

                    <Separator className="my-6" />
                    <h3 className="mb-4 text-lg font-semibold">Job Preferences</h3>

                    <div>
                      <Label htmlFor="jobTypes" className="mb-1 block">Preferred Job Types (comma separated)</Label>
                      <Input
                        id="jobTypes"
                        value={jobTypes}
                        onChange={(e) => setJobTypes(e.target.value)}
                        placeholder="Full-time, Contract, Remote"
                      />
                    </div>

                    <div>
                      <Label htmlFor="locations" className="mb-1 block">Preferred Locations (comma separated)</Label>
                      <Input
                        id="locations"
                        value={locations}
                        onChange={(e) => setLocations(e.target.value)}
                        placeholder="New York, San Francisco, London"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minSalary" className="mb-1 block">Minimum Salary</Label>
                        <Input
                          id="minSalary"
                          type="number"
                          value={minSalary}
                          onChange={(e) => setMinSalary(e.target.value)}
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxSalary" className="mb-1 block">Maximum Salary</Label>
                        <Input
                          id="maxSalary"
                          type="number"
                          value={maxSalary}
                          onChange={(e) => setMaxSalary(e.target.value)}
                          placeholder="100000"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="remote"
                        checked={remote}
                        onCheckedChange={setRemote}
                      />
                      <Label htmlFor="remote">Interested in remote work</Label>
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo" className="mb-1 block">Additional Information (optional)</Label>
                      <Textarea
                        id="additionalInfo"
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="Any other details you'd like your JobPersona to know..."
                        rows={3}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <LoadingButton 
                  type="submit" 
                  onClick={handleSubmit}
                  isLoading={isCreating}
                  loadingText="Creating..."
                >
                  Create JobPersona
                </LoadingButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateJobPersona;
