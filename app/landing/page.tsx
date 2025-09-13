'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Sparkles, 
  Upload, 
  Palette, 
  Download, 
  Clock, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle,
  Play,
  Users,
  TrendingUp,
  Award
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Drag & Drop Upload",
      description: "Upload up to 30 photos at once with our intuitive drag-and-drop interface. Supports JPG and PNG formats with automatic room detection.",
      benefit: "Save 80% of your time on file management"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Virtual Staging",
      description: "Transform empty rooms with professional furniture and décor using Gemini 2.5 Flash AI. Maintains realistic perspective and lighting.",
      benefit: "Increase listing views by 40%"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "6 Room Styles",
      description: "Choose from Modern, Scandinavian, Farmhouse, Minimal, Boho, and Luxury styles. Each optimized for maximum buyer appeal.",
      benefit: "Match any target demographic"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Batch Processing",
      description: "Process multiple photos simultaneously with custom recipes. Save and reuse styling combinations across projects.",
      benefit: "Complete 20-50 photos in under 1 hour"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "MLS-Ready Export",
      description: "Download high-resolution 3000px images ready for MLS listings. Optional compliance watermarks included.",
      benefit: "Professional quality guaranteed"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Compliance & Safety",
      description: "Built-in disclosure features and edit logging. Prevents structural modifications for ethical staging practices.",
      benefit: "Stay compliant with industry standards"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Top Producer, Coldwell Banker",
      content: "StageRight transformed my listing process. I can now stage 30 photos in the time it used to take for 5. My listings get 3x more views.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Real Estate Photographer",
      content: "The AI quality is incredible. Clients can't tell the difference from traditional staging, but we deliver results in minutes, not days.",
      rating: 5
    },
    {
      name: "Jennifer Walsh",
      role: "Broker, RE/MAX Elite",
      content: "The compliance features give me peace of mind. Automatic watermarks and edit logs keep us transparent with buyers.",
      rating: 5
    }
  ]

  const stats = [
    { number: "10,000+", label: "Photos Staged" },
    { number: "500+", label: "Happy Agents" },
    { number: "40%", label: "More Views" },
    { number: "< 30s", label: "Per Photo" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-semibold text-slate-900">StageRight</span>
              <Badge variant="secondary">AI-Powered</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </Link>
              <Button asChild>
                <Link href="/">
                  Try Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6" variant="outline">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by Gemini AI
              </Badge>
              <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Transform Listings with
                <span className="text-blue-600 block">AI Virtual Staging</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Stage 30 photos in under an hour. Professional-quality virtual staging that increases listing views by 40% and sells homes faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="text-lg px-8 py-4" asChild>
                  <Link href="/">
                    Start Staging Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  10 free photos
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  MLS-ready exports
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Virtual Staging Dashboard</h3>
                  <Badge variant="secondary">Live Preview</Badge>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">30</div>
                      <div className="text-sm text-slate-600">Photos Ready</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600"> 15 min</div>
                      <div className="text-sm text-slate-600">Processing Time</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-90">Modern Style Applied</div>
                        <div className="font-semibold">Living Room Staged</div>
                      </div>
                      <Sparkles className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
                <div className="text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Award className="w-3 h-3 mr-1" />
              Professional Features
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Everything You Need for Professional Virtual Staging
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From AI-powered staging to compliance features, StageRight provides all the tools real estate professionals need to create stunning listings.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        activeFeature === index 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 mb-3">
                          {feature.description}
                        </p>
                        <div className="flex items-center text-sm text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {feature.benefit}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:sticky lg:top-24">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                      {features[activeFeature].icon}
                      <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
                    </div>
                    <p className="text-blue-100 mb-6 text-lg">
                      {features[activeFeature].description}
                    </p>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-sm text-blue-100 mb-1">Key Benefit</div>
                      <div className="font-semibold text-lg">{features[activeFeature].benefit}</div>
                    </div>
                  </div>
                  <div className="p-8">
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/">
                        Try This Feature
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Users className="w-3 h-3 mr-1" />
              Customer Success
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Trusted by Top Real Estate Professionals
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join hundreds of agents, brokers, and photographers who are transforming their listings with StageRight.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Listings?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of real estate professionals who are already using StageRight to create stunning, high-converting listings in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-4" asChild>
              <Link href="/">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              Schedule Demo
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              10 free photos
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No setup required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold">StageRight</span>
              </div>
              <p className="text-slate-400 mb-4">
                AI-powered virtual staging for real estate professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 StageRight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}