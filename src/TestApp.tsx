function TestApp() {
  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <h1 style={{ color: "#333", fontSize: "2rem", marginBottom: "1rem" }}>
        DevStackBox Test
      </h1>
      <p style={{ color: "#666", fontSize: "1.2rem" }}>
        If you can see this, the React app is working!
      </p>
      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2 style={{ color: "#333", marginBottom: "1rem" }}>Test Features:</h2>
        <ul style={{ color: "#666" }}>
          <li>✅ React is rendering</li>
          <li>✅ Tauri window is open</li>
          <li>✅ Basic styling works</li>
        </ul>
      </div>
    </div>
  );
}

export default TestApp;
