import { useState, useEffect } from 'react';
import { Menu, X, Code2, Sparkles, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      return token && stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('user');
        if (token && stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    syncUser();

    window.addEventListener('storage', syncUser);
    window.addEventListener('authChange', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('authChange', syncUser);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

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
            <button onClick={() => navigate('/studio')} className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1.5 transition-colors">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              AI Studio
            </button>
            <a href="#features" className="text-gray-700 hover:text-emerald-600 font-medium">Features</a>
            <a href="#age-groups" className="text-gray-700 hover:text-emerald-600 font-medium">Age Groups</a>
            <a href="#testimonials" className="text-gray-700 hover:text-emerald-600 font-medium">Testimonials</a>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>{currentUser.username || currentUser.email || 'Learner'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 font-medium text-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-emerald-600 font-medium">Log In</button>
                <button onClick={() => navigate('/signup')} className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700">Sign Up</button>
              </>
            )}
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
          <button onClick={() => { navigate('/studio'); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 text-base font-semibold text-emerald-600 hover:bg-emerald-50 rounded-md">
            AI Studio
          </button>
          <a href="#features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Features</a>
          <a href="#age-groups" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Age Groups</a>
          <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Testimonials</a>

          {currentUser ? (
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
              <div className="px-3 py-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Signed in as <strong className="text-gray-900">{currentUser.username || currentUser.email || 'Learner'}</strong></span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Log In</button>
              <button onClick={() => { navigate('/signup'); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 text-base font-medium text-gray-700 hover:text-emerald-600">Sign Up</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
