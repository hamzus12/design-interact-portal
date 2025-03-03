
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Building,
  Clock,
  BriefcaseBusiness,
  Calendar,
  Share2,
  BookmarkPlus,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { getJobById, Job } from '@/models/job';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (id) {
          setLoading(true);
          const jobData = await getJobById(parseInt(id));
          setJob(jobData);
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    window.scrollTo(0, 0);
  }, [id]);

  const handleApply = () => {
    toast.success("Your application has been submitted!");
  };

  const handleBookmark = () => {
    toast.success("Job saved to your bookmarks!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Job link copied to clipboard!");
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex animate-pulse flex-col space-y-4 rounded-lg bg-white p-8 shadow-md">
            <div className="h-8 w-3/4 rounded bg-gray-200"></div>
            <div className="h-6 w-1/2 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Job Not Found</h2>
            <p className="mb-6 text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          {/* Back Navigation */}
          <Link 
            to="/jobs" 
            className="mb-8 inline-flex items-center text-red hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Job Details - Left Column */}
            <div className="lg:col-span-2">
              <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-md">
                {/* Job Header */}
                <div className="border-b border-gray-100 bg-red-50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`mr-4 flex h-16 w-16 items-center justify-center rounded-lg ${job.logoColor} text-white text-2xl`}>
                        {job.companyLogo}
                      </div>
                      <div>
                        <h1 className="mb-1 text-2xl font-bold text-gray-900">{job.title}</h1>
                        <p className="text-gray-700">at {job.company}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleBookmark}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-red"
                      >
                        <BookmarkPlus className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={handleShare}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-red"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="p-6">
                  <div className="mb-6 flex flex-wrap gap-4">
                    <div className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                      {job.location}
                    </div>
                    <div className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <Building className="mr-1.5 h-4 w-4 text-gray-500" />
                      {job.category}
                    </div>
                    <div className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <BriefcaseBusiness className="mr-1.5 h-4 w-4 text-gray-500" />
                      {job.jobType || job.type}
                    </div>
                    <div className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                      <Clock className="mr-1.5 h-4 w-4 text-gray-500" />
                      {job.timeAgo}
                    </div>
                  </div>

                  {job.featured && (
                    <Badge className="mb-6 bg-red text-white">Featured</Badge>
                  )}

                  <div className="mb-8 border-b border-gray-100 pb-8">
                    <h2 className="mb-4 text-xl font-semibold">Job Description</h2>
                    <p className="mb-4 text-gray-700">
                      We are looking for a talented and experienced {job.title} to join our growing team at {job.company}. The ideal candidate will have a passion for {job.category.toLowerCase()} and a strong track record of success in similar roles.
                    </p>
                    <p className="mb-4 text-gray-700">
                      As a {job.title} at {job.company}, you will be responsible for developing and implementing strategies, collaborating with cross-functional teams, and driving results that contribute to our company's growth and success.
                    </p>
                  </div>

                  <div className="mb-8 border-b border-gray-100 pb-8">
                    <h2 className="mb-4 text-xl font-semibold">Responsibilities</h2>
                    <ul className="list-disc pl-5 text-gray-700">
                      <li className="mb-2">Develop and implement comprehensive strategies that align with company goals and objectives</li>
                      <li className="mb-2">Collaborate with various teams to ensure successful execution of projects</li>
                      <li className="mb-2">Analyze data and metrics to track performance and identify areas for improvement</li>
                      <li className="mb-2">Stay updated on industry trends and best practices</li>
                      <li className="mb-2">Prepare and present regular reports to management</li>
                    </ul>
                  </div>

                  <div className="mb-8 border-b border-gray-100 pb-8">
                    <h2 className="mb-4 text-xl font-semibold">Requirements</h2>
                    <ul className="list-disc pl-5 text-gray-700">
                      <li className="mb-2">Bachelor's degree in a related field</li>
                      <li className="mb-2">3+ years of experience in a similar role</li>
                      <li className="mb-2">Strong communication and interpersonal skills</li>
                      <li className="mb-2">Excellent analytical and problem-solving abilities</li>
                      <li className="mb-2">Proficiency in relevant software and tools</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="mb-4 text-xl font-semibold">Benefits</h2>
                    <ul className="list-disc pl-5 text-gray-700">
                      <li className="mb-2">Competitive salary and benefits package</li>
                      <li className="mb-2">Professional development opportunities</li>
                      <li className="mb-2">Collaborative and innovative work environment</li>
                      <li className="mb-2">Flexible work arrangements</li>
                      <li className="mb-2">Health and wellness programs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div>
              {/* Application Card */}
              <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold">Job Summary</h2>
                <div className="mb-4 space-y-3">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Published On:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Job Type:</span>
                    <span className="font-medium">{job.jobType || job.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{job.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleApply} 
                  className="mt-4 w-full bg-red hover:bg-red/90"
                >
                  Apply Now
                </Button>
              </div>

              {/* Company Information */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold">About {job.company}</h2>
                <div className="mb-4 flex items-center">
                  <div className={`mr-3 flex h-12 w-12 items-center justify-center rounded-lg ${job.logoColor} text-white`}>
                    {job.companyLogo}
                  </div>
                  <div>
                    <h3 className="font-semibold">{job.company}</h3>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-700">
                  {job.company} is a leading organization in the {job.category.toLowerCase()} industry, dedicated to innovation and excellence. With a strong commitment to quality and customer satisfaction, we strive to deliver exceptional products and services.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-red text-red hover:bg-red hover:text-white"
                >
                  View Company Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
