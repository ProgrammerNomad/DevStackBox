import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PHPVersion {
  version: string;
  status: "installed" | "available" | "downloading";
  isActive: boolean;
  description: string;
  features: string[];
}

interface PHPVersionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
  onVersionChange: (version: string) => void;
}

export function PHPVersionSelector({ 
  isOpen, 
  onClose, 
  currentVersion, 
  onVersionChange 
}: PHPVersionSelectorProps) {
  const [downloadingVersion, setDownloadingVersion] = useState<string | null>(null);

  const phpVersions: PHPVersion[] = [
    {
      version: "8.4",
      status: "available",
      isActive: currentVersion === "8.4",
      description: "Latest stable release with enhanced performance",
      features: ["Property hooks", "Improved performance", "New array functions"]
    },
    {
      version: "8.3",
      status: "available",
      isActive: currentVersion === "8.3",
      description: "Enhanced type system and performance improvements",
      features: ["Typed class constants", "Anonymous readonly classes", "JSON validation"]
    },
    {
      version: "8.2",
      status: "installed",
      isActive: currentVersion === "8.2",
      description: "Default version with readonly classes and enums",
      features: ["Readonly classes", "Disjunctive Normal Form", "New random extension"]
    },
    {
      version: "8.1",
      status: "available",
      isActive: currentVersion === "8.1",
      description: "Stable version with enums and fibers",
      features: ["Enums", "Fibers", "Readonly properties"]
    }
  ];

  const handleDownload = async (version: string) => {
    setDownloadingVersion(version);
    
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the version status (this would be handled by Tauri backend)
      setDownloadingVersion(null);
      
    } catch (error) {
      console.error(`Failed to download PHP ${version}:`, error);
      setDownloadingVersion(null);
    }
  };

  const handleActivate = (version: string) => {
    onVersionChange(version);
    onClose();
  };

  const getStatusBadge = (version: PHPVersion) => {
    if (downloadingVersion === version.version) {
      return <Badge variant="outline" className="animate-pulse">Downloading...</Badge>;
    }
    
    switch (version.status) {
      case "installed":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Installed</Badge>;
      case "available":
        return <Badge variant="secondary">Available</Badge>;
      default:
        return null;
    }
  };

  const getActionButton = (version: PHPVersion) => {
    if (downloadingVersion === version.version) {
      return (
        <Button disabled className="w-full">
          <Download className="w-4 h-4 mr-2 animate-spin" />
          Downloading...
        </Button>
      );
    }

    if (version.status === "available") {
      return (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => handleDownload(version.version)}
        >
          <Download className="w-4 h-4 mr-2" />
          Download & Install
        </Button>
      );
    }

    if (version.isActive) {
      return (
        <Button disabled className="w-full">
          <Check className="w-4 h-4 mr-2" />
          Active Version
        </Button>
      );
    }

    return (
      <Button 
        className="w-full"
        onClick={() => handleActivate(version.version)}
      >
        <Check className="w-4 h-4 mr-2" />
        Activate
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            PHP Version Manager
            <Badge variant="outline">Current: {currentVersion}</Badge>
          </DialogTitle>
          <DialogDescription>
            Download and switch between different PHP versions. Each version can be used independently.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {phpVersions.map((version, index) => (
            <motion.div
              key={version.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={version.isActive ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">PHP {version.version}</CardTitle>
                    {getStatusBadge(version)}
                  </div>
                  <CardDescription>{version.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Key Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {version.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-current rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {getActionButton(version)}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Note:</p>
              <p>Downloaded PHP versions will be stored in the <code>php/</code> directory. 
              You can switch between versions instantly without affecting your projects.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
