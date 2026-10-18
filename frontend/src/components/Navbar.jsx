import { useState } from 'react';
import { Menu, X, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate()
  return (
    <nav className="bg-white shadow-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Code2 className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">CodeBloom</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-emerald-600 font-medium">Features</a>
            <a href="#age-groups" className="text-gray-700 hover:text-emerald-600 font-medium">Age Groups</a>
            <a href="#testimonials" className="text-gray-700 hover:text-emerald-600 font-medium">Testimonials</a>
            <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-emerald-600 font-medium">Log In</button>
            <button onClick={() => navigate('/signup')} className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700">Sign Up</button>
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>



      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden w-full px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Features</a>
          <a href="#age-groups" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Age Groups</a>
          <a href="#testimonials" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Testimonials</a>
          <button onClick={() => navigate('/login')} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Log In</button>
          <button onClick={() => navigate('/signup')} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Sign Up</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
