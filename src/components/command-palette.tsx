import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search,
  Database,
  Server,
  Play,
  Square,
  Settings,
  FileText,
  Info
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Command {
  id: string;
  label: string;
  description: string;
  icon: any;
  action: () => void;
  category: string;
  available: boolean;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onPageChange: (page: string) => void;
  onServiceToggle: (service: string) => void;
}

export function CommandPalette({ isOpen, onClose, onPageChange, onServiceToggle }: CommandPaletteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    // Navigation commands
    {
      id: "nav-dashboard",
      label: t('navigation.dashboard'),
      description: "Go to dashboard",
      icon: Database,
      action: () => { onPageChange("dashboard"); onClose(); },
      category: "Navigation",
      available: true,
      keywords: ["dashboard", "home", "overview"]
    },
    {
      id: "nav-services", 
      label: t('navigation.services'),
      description: "Manage services",
      icon: Server,
      action: () => { onPageChange("services"); onClose(); },
      category: "Navigation", 
      available: true,
      keywords: ["services", "mysql", "php", "apache"]
    },
    {
      id: "nav-settings",
      label: t('navigation.settings'),
      description: "Open settings",
      icon: Settings,
      action: () => { onPageChange("settings"); onClose(); },
      category: "Navigation",
      available: true,
      keywords: ["settings", "config", "preferences"]
    },
    {
      id: "nav-logs",
      label: t('navigation.logs'),
      description: "View logs",
      icon: FileText,
      action: () => { onPageChange("logs"); onClose(); },
      category: "Navigation",
      available: false,
      keywords: ["logs", "debug", "error", "output"]
    },
    {
      id: "nav-about",
      label: t('navigation.about'),
      description: "About DevStackBox",
      icon: Info,
      action: () => { onPageChange("about"); onClose(); },
      category: "Navigation",
      available: true,
      keywords: ["about", "info", "version", "help"]
    },
    
    // Service commands
    {
      id: "service-mysql-start",
      label: "Start MySQL",
      description: "Start MySQL database service",
      icon: Play,
      action: () => { onServiceToggle("mysql"); onClose(); },
      category: "Services",
      available: true,
      keywords: ["mysql", "start", "database", "db"]
    },
    {
      id: "service-mysql-stop",
      label: "Stop MySQL",
      description: "Stop MySQL database service", 
      icon: Square,
      action: () => { onServiceToggle("mysql"); onClose(); },
      category: "Services",
      available: true,
      keywords: ["mysql", "stop", "database", "db"]
    },
    {
      id: "service-php-toggle",
      label: "Toggle PHP",
      description: "Toggle PHP service",
      icon: Server,
      action: () => { onServiceToggle("php"); onClose(); },
      category: "Services",
      available: true,
      keywords: ["php", "toggle", "runtime"]
    }
  ];

  const filteredCommands = commands.filter(command => {
    const searchTerm = query.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.keywords.some(keyword => keyword.includes(searchTerm))
    );
  });

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]?.available) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Search and execute commands quickly</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto p-1">
          <AnimatePresence>
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-2">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {category}
                </div>
                {categoryCommands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = selectedIndex === globalIndex;
                  const Icon = command.icon;
                  
                  return (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <Button
                        variant={isSelected ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto p-2 text-left"
                        disabled={!command.available}
                        onClick={() => command.available && command.action()}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{command.label}</span>
                            {!command.available && (
                              <Badge variant="outline" className="text-xs">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {command.description}
                          </p>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>
          
          {filteredCommands.length === 0 && query && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
        </div>

        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">⏎</kbd> to execute, <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">↑↓</kbd> to navigate
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;
