
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// #region agent log
fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:7',message:'App initialization started',data:{rootElement:document.getElementById("root")?true:false},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'A'})}).catch(()=>{});
// #endregion

const rootElement = document.getElementById("root");
if (!rootElement) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:12',message:'Root element not found',data:{error:'No root element'},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  throw new Error("Root element not found");
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:18',message:'Creating React root',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'A'})}).catch(()=>{});
// #endregion

try {
  const root = createRoot(rootElement);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:23',message:'Rendering app with BrowserRouter',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:30',message:'App rendered successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:33',message:'Error during app initialization',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  throw error;
}

