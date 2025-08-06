import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Play, Square, ExternalLink, Settings, Activity, Download } from "lucide-react";

export interface ServiceStatus {
  running: boolean;
  pid?: number;
  port?: number;
  version?: string;
}

interface MySQLServiceProps {
  status: ServiceStatus;
  loading: boolean;
  onToggle: () => void;
  onOpenConfig?: () => void;
  onViewLogs?: () => void;
  onBackupDatabase?: () => void;
  compact?: boolean;
}

export function MySQLService({ 
  status, 
  loading, 
  onToggle, 
  onOpenConfig, 
  onViewLogs,
  onBackupDatabase,
  compact = false 
}: MySQLServiceProps) {
  const { t } = useTranslation();

  const openPhpMyAdmin = () => {
    window.open("http://localhost/phpmyadmin", "_blank");
  };

  const copyConnectionString = () => {
    const connectionString = `mysql://root@localhost:${status.port || 3306}`;
    navigator.clipboard.writeText(connectionString);
    // TODO: Add toast notification
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="w-full">
        <CardHeader className={compact ? "pb-3" : ""}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <CardTitle className={compact ? "text-lg" : "text-xl"}>
                {t("services.mysql.title", "MySQL Database")}
              </CardTitle>
            </div>
            <Badge 
              variant={status.running ? "default" : "secondary"}
              className={status.running ? "bg-green-500" : "bg-gray-500"}
            >
              {status.running ? t("status.running", "Running") : t("status.stopped", "Stopped")}
            </Badge>
          </div>
          {!compact && (
            <CardDescription>
              {t("services.mysql.description", "Database server for storing application data")}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Service Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {status.pid && (
              <div>
                <span className="text-muted-foreground">PID:</span>
                <span className="ml-2 font-mono">{status.pid}</span>
              </div>
            )}
            {status.port && (
              <div>
                <span className="text-muted-foreground">{t("common.port", "Port")}:</span>
                <span className="ml-2 font-mono">{status.port}</span>
              </div>
            )}
            {status.version && (
              <div className="col-span-2">
                <span className="text-muted-foreground">{t("common.version", "Version")}:</span>
                <span className="ml-2 font-mono">{status.version}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            {/* Primary Action */}
            <Button
              onClick={onToggle}
              disabled={loading}
              variant={status.running ? "destructive" : "default"}
              size={compact ? "sm" : "default"}
              className="w-full"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Activity className="h-4 w-4" />
                </motion.div>
              ) : status.running ? (
                <Square className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {loading 
                ? t("common.loading", "Loading...") 
                : status.running 
                  ? t("actions.stop", "Stop") 
                  : t("actions.start", "Start")
              }
            </Button>

            {/* Quick Access Buttons */}
            {status.running && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={openPhpMyAdmin}
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  className="flex items-center"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  {t("actions.phpmyadmin", "phpMyAdmin")}
                </Button>
                <Button
                  onClick={copyConnectionString}
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  className="flex items-center"
                >
                  <Download className="mr-1 h-3 w-3" />
                  {t("actions.copy", "Copy")}
                </Button>
              </div>
            )}

            {/* Secondary Actions */}
            {!compact && (
              <div className="grid grid-cols-3 gap-2">
                {onOpenConfig && (
                  <Button
                    onClick={onOpenConfig}
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    {t("actions.config", "Config")}
                  </Button>
                )}
                {onViewLogs && (
                  <Button
                    onClick={onViewLogs}
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  >
                    <Activity className="mr-1 h-3 w-3" />
                    {t("actions.logs", "Logs")}
                  </Button>
                )}
                {onBackupDatabase && (
                  <Button
                    onClick={onBackupDatabase}
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    {t("actions.backup", "Backup")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default MySQLService;
