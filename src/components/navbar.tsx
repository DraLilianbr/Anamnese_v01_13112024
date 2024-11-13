import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useBranding } from '../lib/branding';

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { companyName } = useBranding();

  return (
    <nav className="bg-white border-b border-[#b7dcdc]/30">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-[#1594a4]">{companyName}</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="nav-link"
            >
              Dashboard
            </Link>
            {isAuthenticated && (
              <button
                onClick={logout}
                className="nav-link flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}