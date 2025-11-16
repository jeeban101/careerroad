import { Route, LogOut, History, Kanban, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation, isLoading } = useAuth();
  
  // Also query user data directly to be sure
  const { data: directUser } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        return await res.json();
      } catch (error) {
        console.error('Direct user fetch error:', error);
        return null;
      }
    },
    refetchInterval: 5000,
    staleTime: 1000,
  });
  
  // Use direct user data or auth context user
  const currentUser = directUser || user;
  
  // Debug: Log user state
  console.log('Header - user:', user, 'directUser:', directUser, 'currentUser:', currentUser, 'isLoading:', isLoading, 'isLoggedIn:', !!currentUser);
  
  // Force show the button if user exists
  const showMyRoadmapsButton = currentUser && currentUser.id;
  
  // Show button when user is authenticated
  const forceShowButton = false;

  const handleSignIn = () => {
    setLocation('/auth');
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="w-full backdrop-blur-glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Route className="text-purple-400 text-2xl mr-2 cursor-pointer hover:text-purple-300 transition-colors glow-pulse" />
              </Link>
              <Link href="/">
                <span className="font-bold text-xl text-white cursor-pointer hover:text-purple-300 transition-colors">CareerRoad</span>
              </Link>
            </div>
          </div>
          
          {showMyRoadmapsButton ? (
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-2">
                <Link href="/">
                  <Button
                    variant={location === "/" ? "default" : "ghost"}
                    size="sm"
                    className={location === "/" ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-lg font-semibold shimmer"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <Link href="/history">
                  <Button
                    size="sm"
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-lg font-semibold shimmer"
                  >
                    <History className="h-4 w-4" />
                    <span>My Roadmaps</span>
                  </Button>
                </Link>
                <Link href="/kanban">
                  <Button
                    size="sm"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-lg font-semibold shimmer"
                  >
                    <Kanban className="h-4 w-4" />
                    <span>Kanban Board</span>
                  </Button>
                </Link>
              </nav>
              
              <span className="text-sm text-gray-300">
                Welcome, {currentUser ? (currentUser.firstName || currentUser.email) : 'User'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 border-gray-600 text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-glass"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSignIn}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shimmer"
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
