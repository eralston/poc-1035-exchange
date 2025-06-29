import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp, 
  Users, 
  FileText,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Globe,
  Lock,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface ProductPageProps {
  onNavigate?: (page: string) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning-Fast Processing",
      description: "Reduce exchange cycle times by 50%+ with automated workflows and real-time carrier communication.",
      metric: "50% faster"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "SOC 2 Type II compliance with end-to-end encryption and comprehensive audit trails.",
      metric: "SOC 2 Certified"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-Time Tracking",
      description: "Monitor every step of the exchange process with live updates and SLA monitoring.",
      metric: "Live updates"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics & Insights",
      description: "Comprehensive reporting and analytics to optimize your exchange operations.",
      metric: "360° visibility"
    }
  ];

  const benefits = [
    "Reduce NIGO rates by up to 70%",
    "Automate carrier communications",
    "Complete audit trail for compliance",
    "Real-time collaboration across teams",
    "Mobile-responsive design",
    "API-first architecture"
  ];

  const stats = [
    { value: "50%", label: "Faster Processing", description: "Average reduction in cycle time" },
    { value: "70%", label: "Lower NIGO Rates", description: "Fewer not-in-good-order submissions" },
    { value: "99.9%", label: "Uptime SLA", description: "Enterprise-grade reliability" },
    { value: "24/7", label: "Support", description: "Always-on customer success" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects - Much lighter */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center space-y-8">
            <Badge variant="info" size="lg" glow>
              🚀 Revolutionizing 1035 Exchanges
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight">
              The Future of
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Insurance Exchanges
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
              Transform antiquated paper-based 1035 exchanges into a seamless digital workflow. 
              Reduce cycle times, eliminate errors, and deliver exceptional client experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => onNavigate?.('demo')}
                className="text-lg px-8 py-4"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => onNavigate?.('demo')}
                className="text-lg px-8 py-4"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/70 backdrop-blur-sm border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-slate-900">{stat.label}</div>
                <div className="text-sm text-slate-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Built for the Modern Insurance Industry
            </h2>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              Every feature designed to eliminate friction, reduce errors, and accelerate your 1035 exchange operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover glow className="text-center p-8 group">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-slate-700">{feature.description}</p>
                  <Badge variant="info" glow>{feature.metric}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 bg-gradient-to-r from-slate-800 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        {/* Background Effects */}        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="warning" glow>The Problem</Badge>
                <h2 className="text-4xl font-bold text-white">
                  Antiquated Processes Are Costing You
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-red-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300">Weeks-Long Cycle Times</h4>
                    <p className="text-slate-200">Manual processes and paper-based workflows create unnecessary delays</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-red-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300">High NIGO Rates</h4>
                    <p className="text-slate-200">Missing information and errors lead to costly resubmissions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-red-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-300">Poor Client Experience</h4>
                    <p className="text-slate-200">Lack of visibility and communication frustrates clients and agents</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="success" glow>The Solution</Badge>
                <h2 className="text-4xl font-bold text-white">
                  ExchangeFlow Changes Everything
                </h2>
              </div>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                    <span className="text-slate-100">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => onNavigate?.('demo')}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              >
                See It In Action
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Enterprise-Grade Technology
            </h2>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              Built on modern cloud infrastructure with security, scalability, and reliability at its core.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card hover className="p-8 text-center group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Security First</h3>
                <p className="text-slate-700">
                  SOC 2 Type II compliance, end-to-end encryption, and comprehensive audit trails ensure your data is always protected.
                </p>
              </CardContent>
            </Card>

            <Card hover className="p-8 text-center group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">API-First</h3>
                <p className="text-slate-700">
                  Seamlessly integrate with your existing systems through our comprehensive REST API and webhook infrastructure.
                </p>
              </CardContent>
            </Card>

            <Card hover className="p-8 text-center group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Real-Time Analytics</h3>
                <p className="text-slate-700">
                  Gain insights into your operations with comprehensive reporting, SLA monitoring, and performance analytics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Responsive Design Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50/60 to-purple-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Works Everywhere You Do
            </h2>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              Responsive design ensures a perfect experience across all devices and screen sizes.
            </p>
          </div>

          <div className="flex justify-center items-center space-x-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-900">Mobile</h3>
              <p className="text-sm text-slate-700">iOS & Android</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white">
                <Tablet className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-900">Tablet</h3>
              <p className="text-sm text-slate-700">iPad & Android</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-900">Desktop</h3>
              <p className="text-sm text-slate-700">Windows & Mac</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Transform Your 1035 Exchanges?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join leading insurance companies who have already revolutionized their exchange operations with ExchangeFlow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => onNavigate?.('demo')}
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-blue-50"
            >
              Start Free Trial
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => onNavigate?.('contact')}
              className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white/10"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};