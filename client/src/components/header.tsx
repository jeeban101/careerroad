import { Route, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleSignIn = () => {
    setLocation('/auth');
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Route className="text-gray-700 text-2xl mr-2 cursor-pointer" />
              </Link>
              <Link href="/">
                <span className="font-bold text-xl text-gray-900 cursor-pointer">CareerRoad</span>
              </Link>
            </div>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-2">
                <Link href="/">
                  <Button
                    variant={location === "/" ? "default" : "ghost"}
                    size="sm"
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/history">
                  <Button
                    variant={location === "/history" ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </Button>
                </Link>
              </nav>
              
              <span className="text-sm text-gray-700">
                Welcome, {user.firstName || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSignIn}
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
