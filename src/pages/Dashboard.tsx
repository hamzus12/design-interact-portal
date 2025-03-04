
import React from 'react';
import { useUserRole } from '@/context/UserContext';
import { useUser } from '@clerk/clerk-react';
import Layout from '@/components/Layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BriefcaseBusiness, 
  PanelLeft, 
  MessageSquare, 
  BookMarked, 
  UserRoundCog, 
  Bell,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDatabase } from '@/context/DatabaseContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { role } = useUserRole();
  const { user } = useUser();
  const { jobs } = useDatabase();

  // This would come from the database in a real application
  const applications = [
    { id: 1, jobTitle: 'Frontend Developer', company: 'Tech Corp', status: 'pending', date: '2023-10-15' },
    { id: 2, jobTitle: 'UX Designer', company: 'Design Studios', status: 'accepted', date: '2023-10-12' },
    { id: 3, jobTitle: 'Product Manager', company: 'Startup Inc', status: 'rejected', date: '2023-10-10' },
  ];

  const messages = [
    { id: 1, from: 'Jane Recruiter', subject: 'Interview Invitation', date: '2023-10-16', unread: true },
    { id: 2, from: 'HR Team', subject: 'Application Update', date: '2023-10-14', unread: false },
  ];

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName || 'User'}</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="overview" className="data-[state=active]:bg-red-50 data-[state=active]:text-red">Overview</TabsTrigger>
              
              {role === 'candidate' && (
                <>
                  <TabsTrigger value="applications" className="data-[state=active]:bg-red-50 data-[state=active]:text-red">My Applications</TabsTrigger>
                  <TabsTrigger value="saved" className="data-[state=active]:bg-red-50 data-[state=active]:text-red">Saved Jobs</TabsTrigger>
                </>
              )}
              
              {role === 'recruiter' && (
                <>
                  <TabsTrigger value="my-jobs" className="data-[state=active]:bg-red-50 data-[state=active]:text-red">My Job Postings</TabsTrigger>
                  <TabsTrigger value="candidates" className="data-[state=active]:bg-red-50 data-[state=active]:text-red">Applicants</TabsTrigger>
                </>
              )}
              
              {role === 'admin' && (
                <>
                  <TabsTrigger value="users" className="data-[state=active]:bg-red-50 data-[state=active]:text-red">Users</TabsTrigger>
                  <TabsTrigger value="jobs" className="data-[state=active]:bg-red-50 data-[state=active]:text-red">All Jobs</TabsTrigger>
                </>
              )}
              
              <TabsTrigger value="messages" className="data-[state=active]:bg-red-50 data-[state=active]:text-red">Messages</TabsTrigger>
            </TabsList>

            {/* Overview Tab - for all users */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                    <Bell className="h-5 w-5 text-red" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {role === 'candidate' ? (
                        <>
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-sm font-medium">Your application for <span className="text-red">Frontend Developer</span> is being reviewed</p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                          </div>
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-sm font-medium">New message from <span className="text-red">Jane Recruiter</span></p>
                            <p className="text-xs text-gray-500">3 days ago</p>
                          </div>
                        </>
                      ) : role === 'recruiter' ? (
                        <>
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-sm font-medium">New application for <span className="text-red">UX Designer</span> position</p>
                            <p className="text-xs text-gray-500">1 day ago</p>
                          </div>
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-sm font-medium">Your job posting <span className="text-red">Frontend Developer</span> is expiring soon</p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-sm font-medium">New user registration: <span className="text-red">John Smith</span></p>
                            <p className="text-xs text-gray-500">Today</p>
                          </div>
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-sm font-medium">New job posted: <span className="text-red">Senior Developer</span></p>
                            <p className="text-xs text-gray-500">Yesterday</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
                    <PanelLeft className="h-5 w-5 text-red" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {role === 'candidate' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Applications Submitted</p>
                            <p className="font-medium">3</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Interviews Scheduled</p>
                            <p className="font-medium">1</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Saved Jobs</p>
                            <p className="font-medium">5</p>
                          </div>
                        </>
                      ) : role === 'recruiter' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Active Job Postings</p>
                            <p className="font-medium">4</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Total Applications</p>
                            <p className="font-medium">12</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Interviews Scheduled</p>
                            <p className="font-medium">3</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Total Users</p>
                            <p className="font-medium">124</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Active Jobs</p>
                            <p className="font-medium">45</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">New Today</p>
                            <p className="font-medium">7</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">
                      {role === 'candidate' ? 'Recommended Jobs' : 
                       role === 'recruiter' ? 'Recent Applicants' : 'System Status'}
                    </CardTitle>
                    {role === 'candidate' ? 
                      <BriefcaseBusiness className="h-5 w-5 text-red" /> : 
                      <UserRoundCog className="h-5 w-5 text-red" />
                    }
                  </CardHeader>
                  <CardContent>
                    {role === 'candidate' ? (
                      <div className="space-y-3">
                        {jobs.slice(0, 3).map(job => (
                          <div key={job.id} className="rounded-md bg-gray-50 p-3">
                            <p className="text-sm font-medium">{job.title}</p>
                            <p className="text-xs text-gray-500">{job.company} • {job.location}</p>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" className="mt-2 w-full" asChild>
                          <Link to="/jobs">View All Jobs</Link>
                        </Button>
                      </div>
                    ) : role === 'recruiter' ? (
                      <div className="space-y-3">
                        <div className="rounded-md bg-gray-50 p-3">
                          <p className="text-sm font-medium">John Smith</p>
                          <p className="text-xs text-gray-500">Applied for Frontend Developer • 2 days ago</p>
                        </div>
                        <div className="rounded-md bg-gray-50 p-3">
                          <p className="text-sm font-medium">Sarah Johnson</p>
                          <p className="text-xs text-gray-500">Applied for UX Designer • 3 days ago</p>
                        </div>
                        <Button size="sm" variant="outline" className="mt-2 w-full">
                          View All Applicants
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">System Status</p>
                          <Badge className="bg-green-500">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">Last Backup</p>
                          <p className="text-sm">Today, 04:30 AM</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">Server Load</p>
                          <p className="text-sm">23%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Call to action buttons based on role */}
              <div className="flex flex-wrap gap-4">
                {role === 'candidate' && (
                  <>
                    <Button className="bg-red text-white hover:bg-red/90" asChild>
                      <Link to="/jobs">
                        <BriefcaseBusiness className="mr-2 h-4 w-4" />
                        Browse Jobs
                      </Link>
                    </Button>
                  </>
                )}
                
                {role === 'recruiter' && (
                  <>
                    <Button className="bg-red text-white hover:bg-red/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Post New Job
                    </Button>
                  </>
                )}
                
                {role === 'admin' && (
                  <>
                    <Button className="bg-red text-white hover:bg-red/90">
                      <UserRoundCog className="mr-2 h-4 w-4" />
                      Admin Settings
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Candidate-specific tabs */}
            {role === 'candidate' && (
              <>
                <TabsContent value="applications" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">My Applications</h3>
                    <Button variant="outline" size="sm">
                      <BookMarked className="mr-2 h-4 w-4" />
                      Track Applications
                    </Button>
                  </div>
                  
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead className="border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Job Title</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Company</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Applied On</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {applications.map((app) => (
                            <tr key={app.id}>
                              <td className="px-4 py-4 text-sm font-medium">{app.jobTitle}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{app.company}</td>
                              <td className="px-4 py-4 text-sm">
                                <Badge
                                  className={
                                    app.status === 'accepted' ? 'bg-green-500' :
                                    app.status === 'rejected' ? 'bg-gray-500' :
                                    'bg-yellow-500'
                                  }
                                >
                                  {app.status === 'accepted' ? 'Accepted' :
                                   app.status === 'rejected' ? 'Rejected' :
                                   'Pending'}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">{app.date}</td>
                              <td className="px-4 py-4 text-sm">
                                <Button variant="outline" size="sm">View</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="saved" className="space-y-4">
                  <h3 className="text-xl font-semibold">Saved Jobs</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.slice(0, 3).map((job) => (
                      <Card key={job.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-md ${job.logoColor} text-white`}>
                              {job.companyLogo}
                            </div>
                            <div>
                              <CardTitle className="text-base">{job.title}</CardTitle>
                              <CardDescription>{job.company}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <BriefcaseBusiness className="h-4 w-4 text-gray-400" />
                              <span>{job.type}</span>
                            </div>
                            <Badge variant="outline" className="border-red text-red">
                              {job.category}
                            </Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/job/${job.id}`}>View Job</Link>
                          </Button>
                          <Button size="sm" className="bg-red text-white hover:bg-red/90">
                            Apply Now
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </>
            )}

            {/* Messages tab - for all users */}
            <TabsContent value="messages" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Messages</h3>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Compose
                </Button>
              </div>
              
              <div className="rounded-lg bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">From</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {messages.map((message) => (
                        <tr key={message.id} className={message.unread ? 'bg-red-50' : ''}>
                          <td className="px-4 py-4 text-sm font-medium">
                            {message.unread && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red"></span>}
                            {message.from}
                          </td>
                          <td className="px-4 py-4 text-sm">{message.subject}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{message.date}</td>
                          <td className="px-4 py-4 text-sm">
                            <Button variant="outline" size="sm">Read</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {messages.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Recruiter-specific tabs */}
            {role === 'recruiter' && (
              <>
                <TabsContent value="my-jobs" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">My Job Postings</h3>
                    <Button className="bg-red text-white hover:bg-red/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Post New Job
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {jobs.slice(0, 4).map((job) => (
                      <Card key={job.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>{job.title}</CardTitle>
                            <Badge className={job.featured ? 'bg-red' : 'bg-gray-200 text-gray-800'}>
                              {job.featured ? 'Featured' : 'Standard'}
                            </Badge>
                          </div>
                          <CardDescription>{job.company}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <BriefcaseBusiness className="h-4 w-4 text-gray-400" />
                              <span>{job.type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <p className="text-gray-600">Applications: <span className="font-medium">12</span></p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View Applicants</Button>
                          <Button variant="outline" size="sm" className="border-red text-red hover:bg-red hover:text-white">Close</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="candidates" className="space-y-4">
                  <h3 className="text-xl font-semibold">Recent Applicants</h3>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead className="border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Applied For</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-4 text-sm font-medium">John Smith</td>
                            <td className="px-4 py-4 text-sm">Frontend Developer</td>
                            <td className="px-4 py-4 text-sm text-gray-600">Oct 15, 2023</td>
                            <td className="px-4 py-4 text-sm">
                              <Badge className="bg-yellow-500">Pending</Badge>
                            </td>
                            <td className="px-4 py-4 text-sm space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button size="sm" className="bg-green-500 text-white hover:bg-green-600">Accept</Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-4 text-sm font-medium">Sarah Johnson</td>
                            <td className="px-4 py-4 text-sm">UX Designer</td>
                            <td className="px-4 py-4 text-sm text-gray-600">Oct 12, 2023</td>
                            <td className="px-4 py-4 text-sm">
                              <Badge className="bg-green-500">Accepted</Badge>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <Button variant="outline" size="sm">View</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}

            {/* Admin-specific tabs */}
            {role === 'admin' && (
              <>
                <TabsContent value="users" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">User Management</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                  
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead className="border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Role</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-4 text-sm font-medium">John Smith</td>
                            <td className="px-4 py-4 text-sm">john@example.com</td>
                            <td className="px-4 py-4 text-sm">
                              <Badge variant="outline">Candidate</Badge>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <Badge className="bg-green-500">Active</Badge>
                            </td>
                            <td className="px-4 py-4 text-sm space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className="border-red text-red hover:bg-red hover:text-white">Suspend</Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-4 text-sm font-medium">Sarah Johnson</td>
                            <td className="px-4 py-4 text-sm">sarah@example.com</td>
                            <td className="px-4 py-4 text-sm">
                              <Badge variant="outline">Recruiter</Badge>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <Badge className="bg-green-500">Active</Badge>
                            </td>
                            <td className="px-4 py-4 text-sm space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className="border-red text-red hover:bg-red hover:text-white">Suspend</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="jobs" className="space-y-4">
                  <h3 className="text-xl font-semibold">All Jobs</h3>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead className="border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Title</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Company</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Posted By</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {jobs.slice(0, 5).map((job) => (
                            <tr key={job.id}>
                              <td className="px-4 py-4 text-sm font-medium">{job.title}</td>
                              <td className="px-4 py-4 text-sm">{job.company}</td>
                              <td className="px-4 py-4 text-sm">Recruiter Name</td>
                              <td className="px-4 py-4 text-sm">
                                <Badge className="bg-green-500">Active</Badge>
                              </td>
                              <td className="px-4 py-4 text-sm space-x-2">
                                <Button variant="outline" size="sm">View</Button>
                                <Button variant="outline" size="sm" className="border-red text-red hover:bg-red hover:text-white">Remove</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
