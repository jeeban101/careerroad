import { Route, LogOut, History, Kanban, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentUser = user;
  const showMyRoadmapsButton = currentUser && currentUser.id;

  const handleSignIn = () => {
    setLocation('/auth');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="w-full bg-background backdrop-blur-glass border-b border-border sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Route className="text-purple-400 text-2xl mr-2 cursor-pointer hover:text-purple-300 transition-colors" />
              </Link>
              <Link href="/">
                <span className="font-bold text-lg sm:text-xl text-foreground cursor-pointer hover:text-purple-300 transition-colors">CareerRoad</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          {showMyRoadmapsButton ? (
            <>
              <div className="hidden lg:flex items-center space-x-4">
                <nav className="flex items-center space-x-2">
                  <Link href="/">
                    <Button
                      variant={location === "/" ? "default" : "ghost"}
                      size="sm"
                      className={location === "/" ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"}
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
                
                <ThemeToggle />
                <span className="text-sm text-muted-foreground hidden xl:block">
                  Welcome, {currentUser ? (currentUser.firstName || currentUser.email) : 'User'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground backdrop-blur-glass"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="sm" className="text-foreground">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-border w-[280px] sm:w-[320px]">
                  <SheetTitle className="text-foreground mb-6">Navigation</SheetTitle>
                  <div className="flex flex-col space-y-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Welcome, {currentUser ? (currentUser.firstName || currentUser.email) : 'User'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                    
                    <Link href="/" onClick={handleNavClick}>
                      <Button
                        variant={location === "/" ? "default" : "ghost"}
                        className={`w-full justify-start ${location === "/" ? "bg-purple-600 hover:bg-purple-700 text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                      >
                        Home
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard" onClick={handleNavClick}>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    
                    <Link href="/history" onClick={handleNavClick}>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <History className="h-4 w-4 mr-2" />
                        My Roadmaps
                      </Button>
                    </Link>
                    
                    <Link href="/kanban" onClick={handleNavClick}>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        <Kanban className="h-4 w-4 mr-2" />
                        Kanban Board
                      </Button>
                    </Link>
                    
                    <div className="border-t border-border pt-4 mt-4">
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              {/* Unauthenticated Desktop */}
              <div className="hidden sm:flex items-center space-x-4">
                <ThemeToggle />
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSignIn}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shimmer"
                >
                  Sign In
                </Button>
              </div>

              {/* Unauthenticated Mobile */}
              <div className="flex sm:hidden items-center gap-2">
                <ThemeToggle />
                <Button 
                  onClick={handleSignIn}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Sign In
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
