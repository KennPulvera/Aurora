import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Calendar, 
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Star,
  Heart,
  Store,
  Coffee
} from 'lucide-react';

const Landing = ({ onGetStarted }) => {
  const features = [
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "AI-powered insights that help you make data-driven decisions for your business growth.",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Streamline employee management, scheduling, and performance tracking effortlessly.",
      color: "bg-green-500"
    },
    {
      icon: ShoppingCart,
      title: "Sales Optimization",
      description: "Boost your sales with intelligent inventory management and customer insights.",
      color: "bg-purple-500"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated appointment booking and resource allocation powered by AI.",
      color: "bg-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Growth Tracking",
      description: "Monitor your business metrics and identify opportunities for expansion.",
      color: "bg-indigo-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security ensuring your business data is always protected.",
      color: "bg-red-500"
    }
  ];

  const industries = [
    {
      icon: Coffee,
      title: "Food & Beverages",
      description: "Cafes, restaurants, bars, and food service businesses",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Heart,
      title: "Healthcare & Wellness",
      description: "Spas, clinics, fitness centers, and wellness services",
      gradient: "from-pink-500 to-purple-500"
    },
    {
      icon: Store,
      title: "Retail Stores",
      description: "Clothing, electronics, books, and general retail",
      gradient: "from-blue-500 to-indigo-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Cafe Owner",
      business: "Brew & Beans",
      content: "Avasolutions transformed how we manage our cafe. Sales increased 40% in just 3 months!",
      rating: 5
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Clinic Director", 
      business: "WellCare Medical",
      content: "The appointment scheduling and patient management features are game-changers for our practice.",
      rating: 5
    },
    {
      name: "Lisa Thompson",
      role: "Store Manager",
      business: "Fashion Forward",
      content: "Inventory management has never been easier. We've reduced waste by 60% since using Avasolutions.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Avasolutions</h1>
                <p className="text-xs text-gray-600">Your AI Business Assistant</p>
              </div>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onGetStarted}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-blue-500/10"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                Powered by Artificial Intelligence
              </span>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Meet Your
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent block">
                  AI Business Assistant
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform your business with intelligent automation, smart analytics, and seamless management. 
                From cafes to clinics, we've got you covered.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <button
                onClick={onGetStarted}
                className="group bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              
              <button className="text-gray-700 hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center gap-2">
                <Clock size={20} />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center items-center gap-8 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                14-Day Free Trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                Setup in Minutes
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built for Every Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you run a cozy cafe, a bustling clinic, or a thriving retail store, 
              Avasolutions adapts to your industry needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${industry.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <industry.icon className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{industry.title}</h3>
                <p className="text-gray-600 leading-relaxed">{industry.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage, grow, and optimize your business in one intelligent platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by Business Owners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful businesses already using Avasolutions to grow and thrive.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <blockquote className="text-gray-700 text-lg mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                  <div className="text-primary-600 font-medium">{testimonial.business}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-primary-100 mb-10 leading-relaxed">
              Join the AI revolution and discover how Avasolutions can help your business thrive. 
              Start your free trial today – no commitments, no hassle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="group bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center gap-2"
              >
                Start Your Free Trial
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              
              <button className="text-white hover:text-primary-100 px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center gap-2 border border-white/20 hover:border-white/40">
                Contact Sales
              </button>
            </div>
            
            <div className="mt-8 flex justify-center items-center gap-8 text-sm text-primary-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary-200" size={16} />
                Cancel Anytime
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary-200" size={16} />
                24/7 Support
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary-200" size={16} />
                Money-Back Guarantee
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Avasolutions</h3>
                <p className="text-gray-400 text-sm">Your AI Business Assistant</p>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 Avasolutions. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;