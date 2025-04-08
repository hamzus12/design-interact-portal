
import React, { useState, useEffect } from 'react';
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
import { Brain, AlertTriangle } from 'lucide-react';

const EditJobPersona = () => {
  const navigate = useNavigate();
  const { persona, isLoading, hasPersona, updatePersona, isCreating } = useJobPersona();

  // Form state
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [jobTypes, setJobTypes] = useState('');
  const [locations, setLocations] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [remote, setRemote] = useState(false);

  // Load existing persona data
  useEffect(() => {
    if (!isLoading && !hasPersona) {
      navigate('/create-job-persona');
    } else if (!isLoading && persona) {
      setSkills(persona.skills.join(', '));
      setExperience(persona.experience.join('\n'));
      setJobTypes(persona.preferences.jobTypes.join(', '));
      setLocations(persona.preferences.locations.join(', '));
      setMinSalary(persona.preferences.salary.min.toString());
      setMaxSalary(persona.preferences.salary.max.toString());
      setRemote(persona.preferences.remote);
    }
  }, [isLoading, hasPersona, persona, navigate]);

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
      
      // Update the persona
      const success = await updatePersona({
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
      console.error("Error updating job persona:", error);
      toast({
        title: "Error",
        description: "Something went wrong while updating your JobPersona.",
        variant: "destructive"
      });
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Edit Your JobPersona AI</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Update your AI-powered job hunting assistant's profile to improve match accuracy
          </p>
        </div>

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>JobPersona Profile</CardTitle>
            <CardDescription>
              Modify your AI profile to better match job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="ml-2 text-sm font-medium text-amber-800">Important Note</h3>
                  </div>
                  <p className="mt-2 text-sm text-amber-700">
                    Updating your JobPersona profile will affect job matching accuracy. The AI will need to relearn 
                    based on your new profile data.
                  </p>
                </div>

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
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/job-persona')}>
              Cancel
            </Button>
            <LoadingButton 
              type="submit" 
              onClick={handleSubmit}
              isLoading={isCreating}
              loadingText="Updating..."
            >
              Update JobPersona
            </LoadingButton>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default EditJobPersona;
