
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, User } from 'lucide-react';

// Sample blog data
const blogData = [
  {
    id: 1,
    title: 'How to Write a Resume That Will Get You Hired',
    excerpt: 'Learn the essential elements of a standout resume and how to highlight your skills and experience effectively.',
    category: 'Career Advice',
    author: 'Emma Wilson',
    date: 'June 15, 2023',
    readTime: '5 min read',
    image: 'bg-blue-100',
  },
  {
    id: 2,
    title: '10 Questions You Should Ask in Every Job Interview',
    excerpt: 'Asking the right questions can help you determine if a job is the right fit and impress potential employers.',
    category: 'Interviews',
    author: 'Michael Johnson',
    date: 'May 22, 2023',
    readTime: '7 min read',
    image: 'bg-red-100',
  },
  {
    id: 3,
    title: 'The Future of Remote Work: Trends to Watch',
    excerpt: 'How remote work is evolving and what both employers and employees should know about the future of work.',
    category: 'Workplace Trends',
    author: 'David Chen',
    date: 'April 10, 2023',
    readTime: '8 min read',
    image: 'bg-green-100',
  },
  {
    id: 4,
    title: 'Networking Tips for Introverts in the Workplace',
    excerpt: 'Effective strategies for building professional relationships when networking doesn't come naturally.',
    category: 'Networking',
    author: 'Sarah Parker',
    date: 'March 18, 2023',
    readTime: '6 min read',
    image: 'bg-purple-100',
  },
  {
    id: 5,
    title: 'How to Negotiate Your Salary: A Step-by-Step Guide',
    excerpt: 'Practical tips for navigating salary discussions and getting the compensation you deserve.',
    category: 'Negotiation',
    author: 'James Wilson',
    date: 'February 5, 2023',
    readTime: '9 min read',
    image: 'bg-yellow-100',
  },
  {
    id: 6,
    title: 'Mastering the Art of the Career Change',
    excerpt: 'How to successfully transition to a new industry or role, even when you have limited experience.',
    category: 'Career Development',
    author: 'Olivia Martinez',
    date: 'January 12, 2023',
    readTime: '7 min read',
    image: 'bg-pink-100',
  },
];

const categories = ['All', 'Career Advice', 'Interviews', 'Workplace Trends', 'Networking', 'Negotiation', 'Career Development'];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredBlogs = blogData.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-900 animate-fade-in">
            Career Advice & Insights
          </h1>
          
          {/* Search Bar */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="mx-auto flex max-w-xl rounded-md border border-gray-300 bg-white">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search articles"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 pl-10 focus-visible:ring-0 focus-visible:ring-transparent"
                />
              </div>
              <Button className="rounded-l-none bg-red text-white hover:bg-red/90">
                Search
              </Button>
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-8 flex flex-wrap justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                className={
                  activeCategory === category
                    ? 'bg-red text-white hover:bg-red/90'
                    : 'hover:border-red hover:text-red'
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          {/* Blog Grid */}
          {filteredBlogs.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <p className="text-gray-600">No articles found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  <div
                    className={`h-48 ${blog.image} flex items-center justify-center`}
                  >
                    <div className="text-3xl">📝</div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <Badge className="bg-red/10 text-red hover:bg-red/20">
                        {blog.category}
                      </Badge>
                    </div>
                    
                    <h3 className="mb-3 text-xl font-semibold text-gray-900 transition-colors hover:text-red">
                      <a href={`/blog/${blog.id}`}>{blog.title}</a>
                    </h3>
                    
                    <p className="mb-4 text-gray-600 line-clamp-2">{blog.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        {blog.author}
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {blog.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
