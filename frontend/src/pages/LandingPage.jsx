import { useState } from 'react';
import { Menu, X, Book, Code, Award, ChevronRight, Layers, Code2, BarChart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const features = [
    {
      title: "Age-Appropriate Learning",
      description: "Resources tailored to your age group and learning style",
      icon: <Users className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Personalized Pathways",
      description: "Custom learning journeys based on your experience level",
      icon: <Layers className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Progress Tracking",
      description: "Earn badges and track your coding journey milestones",
      icon: <BarChart className="h-6 w-6 text-emerald-600" />
    },
    {
      title: "Curated Resources",
      description: "Hand-picked tutorials and courses from trusted platforms",
      icon: <Award className="h-6 w-6 text-emerald-600" />
    }
  ];

  const testimonials = [
    {
      quote: "CodeBloom helped me find the perfect resources for my 10-year-old daughter who wanted to start coding. She loves the interactive games!",
      author: "Sarah P., Parent"
    },
    {
      quote: "As a college freshman with no coding experience, I was overwhelmed by all the options. CodeBloom guided me to exactly what I needed to get started.",
      author: "Jordan M., Student"
    }
  ];

  const ageGroups = [
    {
      age: "Ages 6-10",
      description: "Playful, visual programming with blocks and simple games",
      platforms: ["Code.org", "Scratch", "Blockly"]
    },
    {
      age: "Ages 10-16",
      description: "Interactive learning with creative projects and challenges",
      platforms: ["Khan Academy", "CodeCombat", "p5.js"]
    },
    {
      age: "Ages 18+",
      description: "Comprehensive pathways to professional development",
      platforms: ["FreeCodeCamp", "The Odin Project", "CS50"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full">


      {/* Navigation */}
      <nav className="bg-white shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Code2 className="h-8 w-8 text-emerald-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">CodeBloom</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-emerald-600 font-medium">Features</a>
              <a href="#age-groups" className="text-gray-700 hover:text-emerald-600 font-medium">Age Groups</a>
              <a href="#testimonials" className="text-gray-700 hover:text-emerald-600 font-medium">Testimonials</a>
              <button onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-emerald-600 font-medium"
              >
                Log In
              </button>
              <button onClick={() => navigate('/signup')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Sign Up
              </button>
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>




        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden w-full">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Features</a>
              <a href="#age-groups" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Age Groups</a>
              <a href="#testimonials" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Testimonials</a>
              <button onClick={() => navigate('/login')}>Log In</button>
              <button onClick={() => navigate('/signup')}>Sign Up</button>
              
            </div>
          </div>
        )}
      </nav>



      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden w-full">
        <div className="w-full">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32 w-full">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 w-full">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center lg:text-left">
                  <h1>
                    <span className="block text-sm font-semibold uppercase tracking-wide text-emerald-600 sm:text-base lg:text-sm xl:text-base">
                      Your Gateway to Coding Education
                    </span>
                    <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                      <span className="block text-gray-900">Start Your Coding</span>
                      <span className="block text-emerald-600">Journey Today</span>
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    CodeBloom helps learners of all ages find the perfect coding resources tailored to their experience level and interests—all in one place.
                  </p>
                  <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <a href="/signup" className="bg-emerald-600 text-white px-6 py-3 rounded-md font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        Get Started
                      </a>
                      <a href="#age-groups" className="text-emerald-600 bg-emerald-50 px-6 py-3 rounded-md font-medium hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        Explore Resources
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Features Section */}
      <div id="features" className="py-12 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Your Personalized Coding Guide
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              CodeBloom helps you navigate the world of coding education with these powerful features.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-md shadow-lg">
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                      <p className="mt-2 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* Age Groups Section */}
      <div id="age-groups" className="py-12 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Age Groups</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Resources for Every Stage
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We've curated the best free resources for each age group and skill level.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {ageGroups.map((group, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-600">{group.age}</h3>
                <p className="mt-2 text-gray-600">{group.description}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Featured Platforms</h4>
                  <ul className="mt-2 space-y-1">
                    {group.platforms.map((platform, i) => (
                      <li key={i} className="flex items-center">
                        <Code className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>{platform}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <a href="/resources" className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700">
                    View resources
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* How It Works Section */}
      <div className="py-12 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple Steps to Start Learning
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-emerald-100 text-emerald-600">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Create Your Profile</h3>
              <p className="mt-2 text-base text-gray-500">
                Tell us your age group and current coding experience
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-emerald-100 text-emerald-600">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Get Personalized Recommendations</h3>
              <p className="mt-2 text-base text-gray-500">
                Receive a customized learning path with curated resources
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-emerald-100 text-emerald-600">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Track Your Progress</h3>
              <p className="mt-2 text-base text-gray-500">
                Earn badges and celebrate milestones as you learn
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* Testimonials Section */}
      <div id="testimonials" className="bg-gray-50 py-12 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What Our Users Say
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <p className="mt-4 font-medium text-gray-900">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="bg-gray-800 w-full">
        <div className="w-full py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <Code2 className="h-8 w-8 text-emerald-400" />
                <span className="ml-2 text-2xl font-bold text-white">CodeBloom</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Your gateway to age-appropriate coding education.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Resource Partners</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">GitHub</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Discord Community</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 md:text-center">
              &copy; 2025 CodeBloom Learning Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default LandingPage;