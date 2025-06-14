
import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-900 animate-fade-in">
            Contact Us
          </h1>
          
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Contact Information */}
              <div className="col-span-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">Get in Touch</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Our Location</p>
                        <p className="text-gray-600">Avenue Habib Bourguiba, Tunis 1001, Tunisia</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Email Us</p>
                        <p className="text-gray-600">hello@jovie.tn</p>
                        <p className="text-gray-600">support@jovie.tn</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Call Us</p>
                        <p className="text-gray-600">+216 70 123 456</p>
                        <p className="text-gray-600">+216 71 987 654</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="col-span-1 md:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">Send us a Message</h2>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                          Your Name
                        </label>
                        <Input
                          id="name"
                          placeholder="Ahmed Ben Ali"
                          className="w-full border-gray-300 focus:border-red focus:ring-red"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                          Your Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ahmed@example.tn"
                          className="w-full border-gray-300 focus:border-red focus:ring-red"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        className="w-full border-gray-300 focus:border-red focus:ring-red"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Your message here..."
                        className="h-32 w-full border-gray-300 focus:border-red focus:ring-red"
                      />
                    </div>
                    
                    <div>
                      <Button type="submit" className="w-full bg-red text-white hover:bg-red/90">
                        Send Message
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Map or Additional Info */}
            <div className="mt-8 rounded-lg bg-white p-6 shadow-md animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Tunisia Map Would Go Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
