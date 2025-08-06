import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface ServiceStatus {
  running: boolean;
  pid?: number;
  port?: number;
  version?: string;
}

function TestApp() {
  const [apacheStatus, setApacheStatus] = useState<ServiceStatus>({ running: false });
  const [mysqlStatus, setMysqlStatus] = useState<ServiceStatus>({ running: false });
  const [phpStatus, setPhpStatus] = useState<ServiceStatus>({ running: false });
  const [loading, setLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>("");
  const [debugPaths, setDebugPaths] = useState<any>({});

  const checkServiceStatus = async () => {
    try {
      const apache = await invoke<ServiceStatus>("get_apache_status");
      const mysql = await invoke<ServiceStatus>("get_mysql_status");
      const php = await invoke<ServiceStatus>("get_php_status");
      
      setApacheStatus(apache);
      setMysqlStatus(mysql);
      setPhpStatus(php);
    } catch (error) {
      console.error("Failed to check service status:", error);
    }
  };

  const debugPathsCheck = async () => {
    try {
      const paths = await invoke("debug_paths");
      setDebugPaths(paths);
    } catch (error) {
      console.error("Failed to debug paths:", error);
    }
  };

  const toggleService = async (service: string) => {
    setLoading(service);
    try {
      let result;
      if (service === "apache") {
        result = await invoke<boolean>("toggle_apache");
      } else if (service === "mysql") {
        result = await invoke<boolean>("toggle_mysql");
      } else {
        result = await invoke<boolean>("toggle_php");
      }
      
      await checkServiceStatus();
      setLogs(prev => prev + `\n${service} ${result ? 'started' : 'stopped'} successfully`);
    } catch (error) {
      setLogs(prev => prev + `\nFailed to toggle ${service}: ${error}`);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    checkServiceStatus();
    debugPathsCheck();
  }, []);

  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <h1 style={{ color: "#333", fontSize: "2rem", marginBottom: "1rem" }}>
        DevStackBox Service Manager
      </h1>
      
      {/* Service Status Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        {/* Apache Service */}
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#fff", 
          border: "1px solid #ddd", 
          borderRadius: "8px" 
        }}>
          <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>Apache HTTP Server</h3>
          <p style={{ 
            color: apacheStatus.running ? "#22c55e" : "#ef4444",
            fontWeight: "bold"
          }}>
            Status: {apacheStatus.running ? "Running" : "Stopped"}
          </p>
          {apacheStatus.pid && <p style={{ color: "#666" }}>PID: {apacheStatus.pid}</p>}
          {apacheStatus.port && <p style={{ color: "#666" }}>Port: {apacheStatus.port}</p>}
          <button
            onClick={() => toggleService("apache")}
            disabled={loading === "apache"}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: apacheStatus.running ? "#ef4444" : "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading === "apache" ? "not-allowed" : "pointer",
              opacity: loading === "apache" ? 0.6 : 1
            }}
          >
            {loading === "apache" ? "..." : (apacheStatus.running ? "Stop" : "Start")}
          </button>
        </div>

        {/* MySQL Service */}
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#fff", 
          border: "1px solid #ddd", 
          borderRadius: "8px" 
        }}>
          <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>MySQL Database</h3>
          <p style={{ 
            color: mysqlStatus.running ? "#22c55e" : "#ef4444",
            fontWeight: "bold"
          }}>
            Status: {mysqlStatus.running ? "Running" : "Stopped"}
          </p>
          {mysqlStatus.pid && <p style={{ color: "#666" }}>PID: {mysqlStatus.pid}</p>}
          {mysqlStatus.port && <p style={{ color: "#666" }}>Port: {mysqlStatus.port}</p>}
          <button
            onClick={() => toggleService("mysql")}
            disabled={loading === "mysql"}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: mysqlStatus.running ? "#ef4444" : "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading === "mysql" ? "not-allowed" : "pointer",
              opacity: loading === "mysql" ? 0.6 : 1
            }}
          >
            {loading === "mysql" ? "..." : (mysqlStatus.running ? "Stop" : "Start")}
          </button>
        </div>

        {/* PHP Service */}
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#fff", 
          border: "1px solid #ddd", 
          borderRadius: "8px" 
        }}>
          <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>PHP 8.2</h3>
          <p style={{ 
            color: phpStatus.running ? "#22c55e" : "#666",
            fontWeight: "bold"
          }}>
            Status: {phpStatus.running ? "Available" : "Not Available"}
          </p>
          {phpStatus.version && <p style={{ color: "#666" }}>Version: {phpStatus.version}</p>}
        </div>
      </div>

      {/* Quick Access */}
      <div style={{ 
        marginBottom: "2rem",
        padding: "1rem", 
        backgroundColor: "#fff", 
        border: "1px solid #ddd", 
        borderRadius: "8px" 
      }}>
        <h3 style={{ color: "#333", marginBottom: "1rem" }}>Quick Access</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => window.open("http://localhost", "_blank")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f97316",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Open Apache (localhost)
          </button>
          <button
            onClick={() => window.open("http://localhost/phpmyadmin", "_blank")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Open phpMyAdmin
          </button>
          <button
            onClick={() => window.open("http://localhost/www", "_blank")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#06b6d4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Open WWW Directory
          </button>
        </div>
      </div>
      <div style={{ 
        marginBottom: "2rem",
        padding: "1rem", 
        backgroundColor: "#fff", 
        border: "1px solid #ddd", 
        borderRadius: "8px" 
      }}>
        <h3 style={{ color: "#333", marginBottom: "1rem" }}>Debug Information</h3>
        <button
          onClick={debugPathsCheck}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "1rem"
          }}
        >
          Refresh Debug Info
        </button>
        <pre style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "1rem", 
          borderRadius: "4px",
          fontSize: "0.875rem",
          overflow: "auto"
        }}>
          {JSON.stringify(debugPaths, null, 2)}
        </pre>
      </div>

      {/* Logs */}
      <div style={{ 
        padding: "1rem", 
        backgroundColor: "#fff", 
        border: "1px solid #ddd", 
        borderRadius: "8px" 
      }}>
        <h3 style={{ color: "#333", marginBottom: "1rem" }}>Service Logs</h3>
        <textarea
          value={logs}
          readOnly
          style={{
            width: "100%",
            height: "200px",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            padding: "0.5rem",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
          placeholder="Service logs will appear here..."
        />
        <button
          onClick={() => setLogs("")}
          style={{
            marginTop: "0.5rem",
            padding: "0.25rem 0.5rem",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}

export default TestApp;
