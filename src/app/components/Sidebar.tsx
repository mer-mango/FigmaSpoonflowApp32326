import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Users, 
  FileText, 
  FolderOpen, 
  Target, 
  Settings,
  Moon,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
  { icon: Home, label: "Today", active: true },
  { icon: CheckSquare, label: "Tasks", active: false },
  { icon: Calendar, label: "Calendar", active: false },
  { icon: Users, label: "Contacts", active: false },
  { icon: FileText, label: "Content", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white">S</span>
          </div>
          <span>Spoon</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.active
                  ? "bg-teal-700 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button variant="outline" className="w-full justify-start gap-3">
          <Moon className="w-4 h-4" />
          Dark mode
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3">
          <LogOut className="w-4 h-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}