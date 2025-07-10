import { Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Route className="text-gray-700 text-2xl mr-2" />
              <span className="font-bold text-xl text-gray-900">CareerRoad</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button className="bg-gray-800 hover:bg-gray-700 text-white">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
