import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import { ApacheService, MySQLService, PHPService, ServiceStatus } from "./index";

interface ServiceManagerProps {
  compact?: boolean;
  onServiceToggle?: (service: string, status: boolean) => void;
  onOpenConfig?: (service: string) => void;
  onViewLogs?: (service: string) => void;
  onOpenPHPVersionSelector?: () => void;
  currentPhpVersion?: string;
}

export function ServiceManager({
  compact = false,
  onServiceToggle,
  onOpenConfig,
  onViewLogs,
  onOpenPHPVersionSelector,
  currentPhpVersion = "8.2"
}: ServiceManagerProps) {
  const [services, setServices] = useState({
    apache: { running: false } as ServiceStatus,
    mysql: { running: false } as ServiceStatus,
    php: { running: false } as ServiceStatus,
  });
  const [loading, setLoading] = useState<string | null>(null);

  // Check service status
  const checkServiceStatus = async () => {
    try {
      const [apache, mysql, php] = await Promise.all([
        invoke<ServiceStatus>("get_apache_status"),
        invoke<ServiceStatus>("get_mysql_status"),
        invoke<ServiceStatus>("get_php_status"),
      ]);
      
      setServices({ apache, mysql, php });
    } catch (error) {
      console.error("Failed to check service status:", error);
    }
  };

  // Toggle service
  const toggleService = async (service: string) => {
    setLoading(service);
    try {
      let result: boolean;
      if (service === "apache") {
        result = await invoke<boolean>("toggle_apache");
      } else if (service === "mysql") {
        result = await invoke<boolean>("toggle_mysql");
      } else {
        result = await invoke<boolean>("toggle_php");
      }
      
      await checkServiceStatus();
      onServiceToggle?.(service, result);
    } catch (error) {
      console.error(`Failed to toggle ${service}:`, error);
    } finally {
      setLoading(null);
    }
  };

  // Handle config opening
  const handleOpenConfig = (service: string) => {
    onOpenConfig?.(service);
  };

  // Handle logs viewing
  const handleViewLogs = (service: string) => {
    onViewLogs?.(service);
  };

  // Handle database backup
  const handleBackupDatabase = async () => {
    try {
      await invoke("backup_mysql_database");
      // TODO: Add success notification
    } catch (error) {
      console.error("Failed to backup database:", error);
    }
  };

  // Handle PHP terminal opening
  const handleOpenTerminal = async () => {
    try {
      await invoke("open_php_terminal", { version: currentPhpVersion });
    } catch (error) {
      console.error("Failed to open PHP terminal:", error);
    }
  };

  useEffect(() => {
    checkServiceStatus();
    
    // Set up periodic status checking
    const interval = setInterval(checkServiceStatus, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const containerClassName = compact 
    ? "grid grid-cols-1 md:grid-cols-3 gap-4" 
    : "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={containerClassName}
    >
      <ApacheService
        status={services.apache}
        loading={loading === "apache"}
        onToggle={() => toggleService("apache")}
        onOpenConfig={() => handleOpenConfig("apache")}
        onViewLogs={() => handleViewLogs("apache")}
        compact={compact}
      />

      <MySQLService
        status={services.mysql}
        loading={loading === "mysql"}
        onToggle={() => toggleService("mysql")}
        onOpenConfig={() => handleOpenConfig("mysql")}
        onViewLogs={() => handleViewLogs("mysql")}
        onBackupDatabase={handleBackupDatabase}
        compact={compact}
      />

      <PHPService
        status={services.php}
        loading={loading === "php"}
        onVersionSelect={onOpenPHPVersionSelector}
        onOpenConfig={() => handleOpenConfig("php")}
        onViewLogs={() => handleViewLogs("php")}
        onOpenTerminal={handleOpenTerminal}
        compact={compact}
        currentVersion={currentPhpVersion}
      />
    </motion.div>
  );
}

export default ServiceManager;
