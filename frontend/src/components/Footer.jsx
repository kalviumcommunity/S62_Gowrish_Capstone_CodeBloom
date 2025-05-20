import { Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 w-full">
      <div className="w-full py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center">
              <Code2 className="h-8 w-8 text-emerald-400" />
              <span className="ml-2 text-2xl font-bold text-white">CodeBloom</span>
            </div>
            <p className="mt-2 text-sm text-gray-400">Your gateway to age-appropriate coding education.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Resource Partners</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Twitter</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">GitHub</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Discord Community</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 md:text-center">&copy; 2025 CodeBloom Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer
