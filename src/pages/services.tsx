import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ServiceManager } from "@/components/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Activity, RefreshCw, Trash2 } from "lucide-react";

interface ServicesPageProps {
  onOpenPHPVersionSelector: () => void;
  currentPhpVersion: string;
}

export function ServicesPage({ onOpenPHPVersionSelector, currentPhpVersion }: ServicesPageProps) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleServiceToggle = (service: string, status: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    const message = `[${timestamp}] ${service} ${status ? 'started' : 'stopped'} successfully\n`;
    setLogs(prev => prev + message);
  };

  const handleOpenConfig = (service: string) => {
    // TODO: Implement config opening
    console.log(`Opening config for ${service}`);
  };

  const handleViewLogs = (service: string) => {
    // TODO: Implement log viewing
    console.log(`Viewing logs for ${service}`);
  };

  const clearLogs = () => {
    setLogs("");
  };

  const refreshServices = () => {
    // The ServiceManager will automatically refresh when this component re-renders
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => prev + `[${timestamp}] Services refreshed\n`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("pages.services.title", "Services")}
          </h1>
          <p className="text-muted-foreground">
            {t("pages.services.description", "Manage your development stack services")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>{t("status.monitoring", "Monitoring")}</span>
          </Badge>
          <Button onClick={refreshServices} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("actions.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      {/* Service Manager */}
      <ServiceManager
        compact={false}
        onServiceToggle={handleServiceToggle}
        onOpenConfig={handleOpenConfig}
        onViewLogs={handleViewLogs}
        onOpenPHPVersionSelector={onOpenPHPVersionSelector}
        currentPhpVersion={currentPhpVersion}
      />

      {/* Service Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{t("services.controls.title", "Service Controls")}</span>
              </CardTitle>
              <CardDescription>
                {t("services.controls.description", "Additional service management options")}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span>{t("settings.autoRefresh", "Auto-refresh")}</span>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center">
              <Activity className="mr-2 h-4 w-4" />
              {t("actions.startAll", "Start All Services")}
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <Settings className="mr-2 h-4 w-4" />
              {t("actions.stopAll", "Stop All Services")}
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("actions.restartAll", "Restart All Services")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>{t("services.logs.title", "Service Logs")}</span>
            </CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              {t("actions.clear", "Clear")}
            </Button>
          </div>
          <CardDescription>
            {t("services.logs.description", "Real-time service activity and error logs")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={logs}
            readOnly
            placeholder={t("services.logs.placeholder", "Service logs will appear here...")}
            className="min-h-[200px] font-mono text-sm"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ServicesPage;
