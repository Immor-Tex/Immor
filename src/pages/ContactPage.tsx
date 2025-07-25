import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your name'
      });
      return false;
    }
    if (!formData.email.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your email'
      });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return false;
    }
    if (!formData.subject.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter a subject'
      });
      return false;
    }
    if (!formData.message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your message'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      await emailjs.send(
        'service_oy7jzom', // Replace with your EmailJS service ID
        'template_vccrw8h', // Replace with your EmailJS template ID
        {
          to_email: 'immortal.textile@gmail.com',
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        'tGxrMwr3Fnq9zGGxx' // Replace with your EmailJS public key
      );

      setStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you soon.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear status message when user starts typing
    if (status.type) {
      setStatus({ type: null, message: '' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-4xl font-bold mb-8">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="font-heading text-2xl font-semibold mb-6">Get in Touch</h2>
            <p className="text-primary-700 mb-8">
              Have questions about our products or need assistance? We're here to help!
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Mail className="text-primary-900 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-lg mb-1">Email</h3>
                  <p className="text-primary-600">immortal.textile@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Phone className="text-primary-900 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-lg mb-1">Phone</h3>
                  <p className="text-primary-600">+212682721588</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <MapPin className="text-primary-900 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-lg mb-1">Location</h3>
                  <p className="text-primary-600">
                    Anassi 33<br />
                    Casablanca, 20640<br />
                    Morocco
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="font-heading text-2xl font-semibold mb-6">Business Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary-700">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-primary-200">
              <h2 className="font-heading text-2xl font-semibold mb-6">Send Us a Message</h2>
              
              {status.type && (
                <div className={`mb-6 p-4 rounded-md ${
                  status.type === 'success' 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-error-100 text-error-700'
                }`}>
                  {status.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-primary-900 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-primary-300 rounded-md px-4 py-2 focus:ring-accent-500 focus:border-accent-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary-900 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-primary-300 rounded-md px-4 py-2 focus:ring-accent-500 focus:border-accent-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-primary-900 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full border border-primary-300 rounded-md px-4 py-2 focus:ring-accent-500 focus:border-accent-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-primary-900 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full border border-primary-300 rounded-md px-4 py-2 focus:ring-accent-500 focus:border-accent-500"
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-primary-900 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center ${
                    isSubmitting 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:bg-primary-800'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'} 
                  {!isSubmitting && <Send size={18} className="ml-2" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;