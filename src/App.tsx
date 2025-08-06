import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import { Database, Server, Settings, Terminal, FileText, Download, Command as CommandIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "./components/language-switcher";
import { Sidebar } from "./components/sidebar";
import { CommandPalette } from "./components/command-palette";
import { PHPVersionSelector } from "./components/php-version-selector";
import "./lib/i18n";

function App() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [phpVersionSelectorOpen, setPhpVersionSelectorOpen] = useState(false);
  const [currentPhpVersion, setCurrentPhpVersion] = useState("8.2");
  const [services, setServices] = useState({
    mysql: false,
    php: false,
    apache: false,
  });
  const [loadingServices, setLoadingServices] = useState({
    mysql: false,
    php: false,
    apache: false,
  });
  const [configView, setConfigView] = useState<'apache' | 'mysql' | null>(null);

  const serviceCards = [
    {
      title: t('services.apache.title'),
      description: t('services.apache.description'),
      icon: Terminal,
      status: services.apache,
      action: "apache",
      available: true,
    },
    {
      title: t('services.mysql.title'),
      description: t('services.mysql.description'),
      icon: Database,
      status: services.mysql,
      action: "mysql",
      available: true,
    },
    {
      title: `${t('services.php.title')} ${currentPhpVersion}`,
      description: t('services.php.description'),
      icon: Server,
      status: services.php,
      action: "php",
      available: true,
      isVersionSwitcher: true,
    },
  ];

  const featureCards = [
    {
      title: t('features.phpmyadmin.title'),
      description: t('features.phpmyadmin.description'),
      icon: Database,
      available: true,
    },
    {
      title: t('features.config.title'), 
      description: t('features.config.description'),
      icon: Settings,
      available: true,
    },
    {
      title: t('features.logs.title'),
      description: t('features.logs.description'),
      icon: FileText,
      available: false,
    },
    {
      title: t('features.installers.title'),
      description: t('features.installers.description'),
      icon: Download,
      available: false,
    },
  ];

  const toggleService = async (service: string) => {
    // Prevent double-clicks
    if (loadingServices[service as keyof typeof loadingServices]) {
      return;
    }

    setLoadingServices(prev => ({
      ...prev,
      [service]: true
    }));

    try {
      const result = await invoke(`toggle_${service}`);
      setServices(prev => ({
        ...prev,
        [service]: result as boolean
      }));
    } catch (error) {
      console.error(`Failed to toggle ${service}:`, error);
      // Show error to user
      alert(`Failed to ${services[service as keyof typeof services] ? 'stop' : 'start'} ${service}: ${error}`);
    } finally {
      setLoadingServices(prev => ({
        ...prev,
        [service]: false
      }));
    }
  };

  const checkServiceStatus = async () => {
    try {
      const mysqlStatus = await invoke('get_mysql_status') as { running: boolean };
      const phpStatus = await invoke('get_php_status') as { running: boolean };
      const apacheStatus = await invoke('get_apache_status') as { running: boolean };
      
      setServices({
        mysql: mysqlStatus.running,
        php: phpStatus.running,
        apache: apacheStatus.running,
      });
    } catch (error) {
      console.error('Failed to check service status:', error);
    }
  };

  // Debug function to test paths
  const debugPaths = async () => {
    try {
      const paths = await invoke('debug_paths') as Record<string, string>;
      console.log('Debug Paths:', paths);
      alert(`Debug Paths:\n${Object.entries(paths).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
    } catch (error) {
      console.error('Debug paths failed:', error);
      alert(`Debug failed: ${error}`);
    }
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
    checkServiceStatus();
    const interval = setInterval(checkServiceStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "services":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{t('services.title')}</h2>
              <button 
                onClick={debugPaths}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Debug Paths
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCards.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.action}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Icon className="w-8 h-8 text-primary" />
                          <Badge 
                            variant={service.status ? "default" : "secondary"}
                            className={service.status ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {service.status ? t('common.running') : t('common.stopped')}
                          </Badge>
                        </div>
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button
                            onClick={() => service.isVersionSwitcher ? setPhpVersionSelectorOpen(true) : toggleService(service.action)}
                            disabled={!service.available || loadingServices[service.action as keyof typeof loadingServices]}
                            className="w-full"
                            variant={service.isVersionSwitcher ? "outline" : service.status ? "destructive" : "default"}
                          >
                            {loadingServices[service.action as keyof typeof loadingServices] 
                              ? "Loading..." 
                              : service.available
                                ? service.isVersionSwitcher
                                  ? `Switch PHP Version (${currentPhpVersion})`
                                  : service.status
                                    ? t('common.stop')
                                    : t('common.start')
                                : t('common.comingSoon')
                            }
                          </Button>
                          
                          {/* Config button for Apache and MySQL */}
                          {(service.action === 'apache' || service.action === 'mysql') && (
                            <Button
                              onClick={() => {
                                setConfigView(service.action as 'apache' | 'mysql');
                                setCurrentPage('settings');
                              }}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Configure {service.title}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                      {!service.available && (
                        <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                          <Badge variant="outline">{t('common.planned')}</Badge>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
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
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('navigation.dashboard')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {serviceCards.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <motion.div
                      key={service.action}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="relative">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Icon className="w-8 h-8 text-primary" />
                            <Badge 
                              variant={service.status ? "default" : "secondary"}
                              className={service.status ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {service.status ? t('common.running') : t('common.stopped')}
                            </Badge>
                          </div>
                          <CardTitle>{service.title}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => service.isVersionSwitcher ? setPhpVersionSelectorOpen(true) : toggleService(service.action)}
                            disabled={!service.available}
                            className="w-full"
                            variant={service.isVersionSwitcher ? "outline" : service.status ? "destructive" : "default"}
                          >
                            {service.available
                              ? service.isVersionSwitcher
                                ? `Switch PHP Version (${currentPhpVersion})`
                                : service.status
                                  ? t('common.stop')
                                  : t('common.start')
                              : t('common.comingSoon')
                            }
                          </Button>
                        </CardContent>
                        {!service.available && (
                          <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                            <Badge variant="outline">{t('common.planned')}</Badge>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('features.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featureCards.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    >
                      <Card className="relative h-full">
                        <CardHeader>
                          <Icon className="w-8 h-8 text-primary mb-2" />
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                        {!feature.available && (
                          <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                            <Badge variant="outline">{t('common.inProgress')}</Badge>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
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
          onServiceToggle={toggleService}
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
