import { Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Route className="text-[hsl(var(--brand-indigo))] text-2xl mr-2" />
              <span className="font-bold text-xl text-gray-900">CareerRoad</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button className="bg-[hsl(var(--brand-indigo))] hover:bg-[hsl(var(--brand-indigo))]/90">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
