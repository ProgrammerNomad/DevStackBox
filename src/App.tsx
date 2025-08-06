import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import { Server, Command as CommandIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "./components/language-switcher";
import { Sidebar } from "./components/sidebar";
import { CommandPalette } from "./components/command-palette";
import { PHPVersionSelector } from "./components/php-version-selector";
import { DashboardPage, ServicesPage } from "./pages";
import "./lib/i18n";

function App() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [phpVersionSelectorOpen, setPhpVersionSelectorOpen] = useState(false);
  const [currentPhpVersion, setCurrentPhpVersion] = useState("8.2");
  const [configView, setConfigView] = useState<'apache' | 'mysql' | null>(null);

  // Stub function for command palette - services are now managed by individual pages
  const handleServiceToggle = (service: string) => {
    console.log(`Service toggle requested: ${service}. Navigate to Services page for full management.`);
    setCurrentPage("services");
  };

  // Initialize directory structure on startup
  const initializeApp = async () => {
    try {
      await invoke('create_directory_structure');
      console.log('Directory structure created successfully');
      
      // Check if binaries exist
      const binaries = await invoke('check_binaries') as Record<string, boolean>;
      console.log('Binary status:', binaries);
      
      if (!binaries.mysql) {
        console.warn('MySQL binary not found at mysql/bin/mysqld.exe');
      }
      if (!binaries.apache) {
        console.warn('Apache binary not found at apache/bin/httpd.exe');
      }
      if (!binaries['php8.2']) {
        console.warn('PHP 8.2 binary not found at php/8.2/php.exe');
      }
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    initializeApp();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "services":
        return (
          <ServicesPage
            onOpenPHPVersionSelector={() => setPhpVersionSelectorOpen(true)}
            currentPhpVersion={currentPhpVersion}
          />
        );
      
      case "settings":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{t('navigation.settings')}</h2>
              {configView && (
                <Button
                  onClick={() => setConfigView(null)}
                  variant="outline"
                  size="sm"
                >
                  Back to General Settings
                </Button>
              )}
            </div>
            
            {configView === 'apache' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Apache Configuration</CardTitle>
                  <CardDescription>Configure Apache HTTP Server settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Configuration File</label>
                    <p className="text-sm text-muted-foreground mb-2">C:\box\DevStackBox\config\httpd.conf</p>
                    <Button
                      onClick={() => alert('Opening Apache config editor (coming soon)')}
                      variant="outline"
                    >
                      Edit Configuration
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Document Root</label>
                    <p className="text-sm text-muted-foreground">C:\box\DevStackBox\www</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Port</label>
                    <p className="text-sm text-muted-foreground">80</p>
                  </div>
                </CardContent>
              </Card>
            ) : configView === 'mysql' ? (
              <Card>
                <CardHeader>
                  <CardTitle>MySQL Configuration</CardTitle>
                  <CardDescription>Configure MySQL database server settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Configuration File</label>
                    <p className="text-sm text-muted-foreground mb-2">C:\box\DevStackBox\config\my.cnf</p>
                    <Button
                      onClick={() => alert('Opening MySQL config editor (coming soon)')}
                      variant="outline"
                    >
                      Edit Configuration
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data Directory</label>
                    <p className="text-sm text-muted-foreground">C:\box\DevStackBox\mysql\data</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Port</label>
                    <p className="text-sm text-muted-foreground">3306</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Application Settings</CardTitle>
                  <CardDescription>Configure DevStackBox preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t('common.comingSoon')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case "about":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">{t('navigation.about')}</h2>
            <Card>
              <CardHeader>
                <CardTitle>{t('app.title')}</CardTitle>
                <CardDescription>{t('app.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Version: 1.0.0</p>
                  <p className="text-sm text-muted-foreground">Built with Tauri, React, and Rust</p>
                </div>
                <div>
                  <p className="font-semibold">Author: Nomad Programmer</p>
                  <p className="text-sm text-muted-foreground">shiv@srapsware.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <DashboardPage
            onOpenPHPVersionSelector={() => setPhpVersionSelectorOpen(true)}
            onPageChange={setCurrentPage}
            currentPhpVersion={currentPhpVersion}
          />
        );
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="devstackbox-ui-theme">
      <div className="min-h-screen bg-background">
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onPageChange={setCurrentPage}
          onServiceToggle={handleServiceToggle}
        />

        {/* PHP Version Selector */}
        <PHPVersionSelector
          isOpen={phpVersionSelectorOpen}
          onClose={() => setPhpVersionSelectorOpen(false)}
          currentVersion={currentPhpVersion}
          onVersionChange={setCurrentPhpVersion}
        />

        {/* Main Content */}
        <div 
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-60'
          }`}
        >
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
                >
                  <Server className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold">{t('app.title')}</h1>
                  <p className="text-muted-foreground text-sm">{t('app.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCommandPaletteOpen(true)}
                  title="Command Palette (Ctrl+P)"
                >
                  <CommandIcon className="h-[1.2rem] w-[1.2rem]" />
                </Button>
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="container mx-auto px-4 py-8">
            {renderPage()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
