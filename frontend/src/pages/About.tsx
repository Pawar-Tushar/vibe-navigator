import { ArrowLeft, Bot, Sparkles, Map, Search, Shield, Brain, Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex-1" />
          <h1 className="text-lg font-semibold text-slate-800">Project Documentation</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Project Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 leading-tight">
            Vibe Navigator:<br />
            <span className="text-cyan-600">Beyond Search, Towards Feeling</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            An AI-powered city explorer that transforms qualitative human experience into actionable insights, 
            helping people discover places based on mood and feeling, not just keywords.
          </p>
        </section>

        {/* Problem & Solution */}
        <section className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">The Problem</h2>
            <p className="text-slate-600 leading-relaxed">
              In a world saturated with data, we've forgotten how to find places based on how they make us feel. 
              Traditional search engines and review sites can tell you if a cafe has good coffee, but they can't 
              tell you if it's the right spot for a focused work session, a lively first date, or a quiet moment of reflection.
            </p>
            <p className="text-slate-600 leading-relaxed">
              The true "vibe" of a place is lost in a sea of star ratings and fragmented reviews.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">The Solution</h2>
            <p className="text-slate-600 leading-relaxed">
              Vibe Navigator solves this problem by transforming qualitative, human experience into quantitative, 
              actionable insight. It's not just another summarizer; it's an AI-powered city concierge.
            </p>
            <p className="text-slate-600 leading-relaxed">
              By leveraging a sophisticated Retrieval-Augmented Generation (RAG) pipeline, Vibe Navigator analyzes 
              thousands of real user reviews to distill the authentic, nuanced vibe of any location.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">The Vibe AI Agent</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Go beyond search bars. Chat naturally with a friendly, persona-driven AI concierge that "knows the city." 
                Get personalized recommendations and story-driven tour plans.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">AI-Powered Vibe Cards</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Understand the soul of a place at a glance. Our AI generates playful summaries, relevant tags, 
                and mood-based emojis for every location, all derived from authentic user reviews.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Map className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Interactive Exploration</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Seamlessly switch between a scannable grid of Vibe Cards and an interactive map view. 
                Filter results with dynamically generated vibe tags.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Trust & Transparency</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every AI-generated recommendation is accompanied by direct citations from source reviews. 
                We believe in grounded AI that shows the "why" behind every suggestion.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">A System That Learns</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our "near real-time" data pipeline means the app is always getting smarter. 
                Automated background processes continuously update location data.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Intuitive Discovery</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Search by mood, feeling, or activity. Find "cozy coffee shops," "romantic dinner spots," 
                or "energetic workout spaces" with natural language queries.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center">Architecture & Technology</h2>
          <div className="bg-white rounded-xl p-8 shadow-md">
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Vibe Navigator is built on a modern, scalable, and decoupled architecture designed for performance and reliability. 
                The system separates offline data processing from the real-time API service, ensuring a responsive user experience.
              </p>
              
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Architectural Pattern: Event-Driven Microservices & RAG</h3>
                <p className="text-slate-600 leading-relaxed">
                  The core of the system is an event-driven pipeline where new data triggers a chain of processing tasks, 
                  and a Retrieval-Augmented Generation (RAG) pipeline powers all user-facing AI interactions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-800">Backend & AI</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li><strong>FastAPI (Python):</strong> Asynchronous performance with automatic documentation</li>
                    <li><strong>Google Gemini:</strong> Powerful generative and conversational AI capabilities</li>
                    <li><strong>Google Embeddings:</strong> Semantic vector representations for search</li>
                    <li><strong>Pinecone:</strong> Specialized vector database for similarity searches</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-800">Data & Frontend</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li><strong>MongoDB Atlas:</strong> Primary datastore and source of truth</li>
                    <li><strong>Selenium:</strong> Dynamic web scraping for review data</li>
                    <li><strong>React/Vite:</strong> Fast, modern frontend with TypeScript</li>
                    <li><strong>Tailwind CSS:</strong> Responsive design with consistent theming</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Developer & CTA */}
        <section className="bg-gradient-to-br from-cyan-50 to-amber-50 rounded-2xl p-8 text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-800">About the Developer</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            This project was conceived, designed, and built as a showcase of full-stack AI engineering capabilities. 
            My approach was to think like a Product Designer, act like a System Architect, and build like a Full-Stack AI Engineer.
          </p>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            I believe the future of user interfaces lies in creating seamless, intuitive, and trustworthy experiences 
            powered by grounded AI. Vibe Navigator is my exploration of that future.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a 
              href="mailto:hello@vibenavigator.com" 
              className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-full hover:bg-slate-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Get in Touch
            </a>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 bg-white text-slate-800 border border-slate-300 px-6 py-3 rounded-full hover:bg-slate-50 transition-colors"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 bg-white text-slate-800 border border-slate-300 px-6 py-3 rounded-full hover:bg-slate-50 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              Connect
            </a>
          </div>
        </section>

        {/* Live Demo CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Ready to Explore?</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Experience Vibe Navigator in action and discover your city's hidden gems.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-cyan-600 transition-colors"
          >
            Try Vibe Navigator
            <ExternalLink className="w-5 h-5" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;