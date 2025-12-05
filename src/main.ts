import Dashboard from './lib/dashboard.svelte';
import { initInterceptor } from '@/core';
import { initStore, addRule } from './store/store';
import axios from 'axios';

initInterceptor();
initStore();

const profileRule = {
  "id": "profile-demo",
  "url": "/api/user/profile",
  "method": "GET",
  "response": {
    "id": "@guid",
    "username": "@name",
    "email": "@email",
    "avatar": "@image(80x80)",
    "role": "Developer",
    "joinDate": "@date",
    "badges|3": ["@pick(Pro,Top Rated,Verified,Early Adopter)"]
  },
  "enabled": true,
  "delay": 500,
  "status": 200,
  "headers": {}
};
addRule(profileRule.url, profileRule.method, profileRule.response);

const loginRule = {
  "id": "login-demo",
  "url": "/api/auth/login",
  "method": "POST",
  "response": (req: any) => {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (body.username === 'admin') {
      return {
        status: 200,
        body: { token: "eyJhbGciOiJIUz...", user: { name: "Super Admin", role: "admin" } }
      };
    }

    return {
      status: 401,
      body: { error: "Unauthorized: Invalid credentials. Try 'admin'." }
    };
  },
  "enabled": true,
  "delay": 600,
  "status": 200,
  "headers": {}
};
addRule(loginRule.url, loginRule.method, loginRule.response);

// Scenario D: Error Simulation
const errorRule = {
  "id": "error-demo",
  "url": "/api/system/status",
  "method": "GET",
  "response": {
    error: "Service Unavailable",
    code: "ERR_DB_CONNECTION_TIMEOUT"
  },
  "enabled": true,
  "delay": 300,
  "status": 500,
  "headers": {}
};
addRule(errorRule.url, errorRule.method, errorRule.response);

new Dashboard({ target: document.body });

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="demo-container">
    <header class="hero">
      <div class="logo-badge">PocketMock</div>
      <h1>Browser-Native API Mocking</h1>
      <p>Intercept, Modify, and Debug HTTP requests without leaving your UI.</p>
    </header>

    <div class="grid-layout">
      <!-- CARD 1: Smart Data -->
      <div class="card" style="padding: 24px;">
        <div class="card-badge get">GET</div>
        <h3>Smart Generators</h3>
        <p>Generate realistic data instantly using syntax like <code>@email</code>, <code>@image</code>.</p>
        <div class="url-pill">/api/user/profile</div>
        <div class="card-action">
          <button id="btn-smart" class="btn primary">
            <span>Fetch Profile</span>
          </button>
        </div>
      </div>

      <!-- CARD 2: Lists -->
      <div class="card" style="padding: 24px;">
        <div class="card-badge get">GET</div>
        <h3>List Simulation</h3>
        <p>Simulate arrays effortlessly using the <code>|count</code> syntax.</p>
        <div class="url-pill">/api/products/featured</div>
        <div class="card-action">
          <button id="btn-list" class="btn primary">
            <span>Load Products</span>
          </button>
        </div>
      </div>

      <!-- CARD 3: Logic -->
      <div class="card" style="padding: 24px;">
        <div class="card-badge post">POST</div>
        <h3>Dynamic Logic</h3>
        <p>Use functions to handle logic. Try <b>admin</b> vs other users.</p>
        <div class="url-pill">/api/auth/login</div>
        <div class="input-row">
          <input type="text" id="username" value="admin" placeholder="Username">
          <button id="btn-login" class="btn accent">Login</button>
        </div>
      </div>

      <!-- CARD 4: Errors -->
      <div class="card" style="padding: 24px;">
        <div class="card-badge err">500</div>
        <h3>Error States</h3>
        <p>Test your app's resilience by simulating 500/404 errors.</p>
        <div class="url-pill">/api/system/status</div>
        <div class="card-action">
          <button id="btn-error" class="btn danger">
            <span>Trigger 500</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Live Monitor -->
    <div class="monitor-section">
      <div class="monitor-header">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
        <span class="monitor-title">Live Network Traffic</span>
        <button id="btn-clear" class="clear-btn">Clear Log</button>
      </div>
      <div id="console-output" class="monitor-body">
        <div class="log-placeholder">// Waiting for requests...</div>
      </div>
    </div>

    <div class="tutorial-section">
      <h2>PocketMock Tutorial:</h2>
      <p>Welcome to PocketMock! This is a powerful, browser-native API mocking tool that helps you intercept, modify, and debug HTTP requests directly in your browser.</p>

      <h3>1. Overview:</h3>
      <ul>
        <li>PocketMock works by intercepting requests made from your browser.</li>
        <li>You can define custom rules to mock responses, introduce delays, simulate errors, and even use dynamic data generators.</li>
      </ul>

      <h3>2. Defining Rules:</h3>
      <p>Rules are defined using <code>addRule(url, method, response)</code>.</p>
      <ul>
        <li><code>url</code>: The URL pattern to match (e.g., "/api/user/profile").</li>
        <li><code>method</code>: The HTTP method (e.g., "GET", "POST").</li>
        <li><code>response</code>: Can be a static JSON object, a function for dynamic responses, or a status code.</li>
      </ul>
      <p>Examples from this demo:</p>
      <ul>
        <li><code>profileRule</code>: Demonstrates smart data generation with <code>@guid</code>, <code>@name</code>, etc.</li>
        <li><code>loginRule</code>: Shows how to use a function to create dynamic responses based on request body (e.g., username 'admin').</li>
        <li><code>errorRule</code>: Simulates a 500 server error with a custom error message.</li>
      </ul>

      <h3>3. Interacting with the Dashboard:</h3>
      <ul>
        <li>The PocketMock dashboard (opened by default) provides a UI to manage all your mock rules.</li>
        <li>You can enable/disable rules, edit their responses, and observe network traffic.</li>
        <li>Try clicking the "Fetch Profile", "Login", and "Trigger 500" buttons in the demo UI to see the mock rules in action and observe the responses in the "Live Network Traffic" monitor below.</li>
      </ul>

      <h3>4. Key Features:</h3>
      <ul>
        <li>Request Interception: Intercepts XHR and Fetch requests.</li>
        <li>Dynamic Responses: Use functions for advanced mocking logic.</li>
        <li>Data Generation: Supports a wide range of data types using simple syntax.</li>
        <li>Delay Simulation: Add artificial network delays to test loading states.</li>
        <li>Error Simulation: Easily test error handling in your application.</li>
        <li>URL Matching: Supports exact matches and basic pattern matching.</li>
      </ul>

      <h3>Get Started:</h3>
      <ul>
        <li>Open the PocketMock dashboard to see and manage your rules.</li>
        <li>Refer to the official <a href="https://github.com/tianchangNorth/pocket-mocker" target="_blank" style="color:white">PocketMock documentation</a> for more advanced features!</li>
      </ul>
    </div>
  </div>
`;

// ==========================================
// 5. Styling (Cyberpunk/Clean Theme)
// ==========================================
const style = document.createElement('style');
style.textContent = `
  :root {
    --bg-dark: #0f172a;
    --card-bg: #1e293b;
    --text-main: #f1f5f9;
    --text-muted: #94a3b8;
    --primary: #3b82f6;
    --accent: #8b5cf6;
    --danger: #ef4444;
    --success: #22c55e;
    --border: #334155;
  }

  body {
    margin: 0;
    background-color: var(--bg-dark);
    color: var(--text-main);
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .demo-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 20px;
    padding-bottom: 120px;
  }

  .hero {
    text-align: center;
    margin-bottom: 60px;
    animation: fadeIn 0.8s ease-out;
  }

  .logo-badge {
    display: inline-block;
    background: rgba(59, 130, 246, 0.1);
    color: var(--primary);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 16px;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  h1 {
    font-size: 3rem;
    margin: 0 0 16px 0;
    background: linear-gradient(to right, #fff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
  }

  .hero p {
    color: var(--text-muted);
    font-size: 1.2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .tutorial-section {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    margin-top: 40px;
  }

  .tutorial-section h2 {
    color: var(--primary);
    margin-top: 0;
    font-size: 1.8rem;
  }

  .tutorial-section h3 {
    color: var(--accent);
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.2rem;
  }

  .tutorial-section p, .tutorial-section li {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .tutorial-section ul {
    list-style: disc;
    padding-left: 20px;
    margin-bottom: 15px;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    border-color: var(--primary);
  }

  .card-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .card-badge.get { background: rgba(34, 197, 94, 0.15); color: var(--success); }
  .card-badge.post { background: rgba(139, 92, 246, 0.15); color: var(--accent); }
  .card-badge.err { background: rgba(239, 68, 68, 0.15); color: var(--danger); }

  .card h3 {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
  }

  .card p {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.5;
    flex-grow: 1;
    margin-bottom: 20px;
  }

  code {
    background: rgba(0,0,0,0.3);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    color: var(--primary);
  }

  .url-pill {
    background: #0f172a;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 16px;
    border: 1px solid #334155;
  }

  .btn {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .btn:hover { opacity: 0.9; }
  .btn.primary { background: var(--primary); color: white; }
  .btn.accent { background: var(--accent); color: white; }
  .btn.danger { background: var(--danger); color: white; }

  .input-row {
    display: flex;
    gap: 8px;
  }
  
  input {
    background: #0f172a;
    border: 1px solid var(--border);
    color: white;
    padding: 10px;
    border-radius: 8px;
    width: 100%;
    outline: none;
  }
  input:focus { border-color: var(--accent); }

  /* Monitor Section */
  .monitor-section {
    background: #000;
    border-radius: 12px;
    border: 1px solid #333;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  }

  .monitor-header {
    background: #1a1a1a;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #333;
  }

  .dot {
    width: 10px; 
    height: 10px; 
    border-radius: 50%; 
    margin-right: 6px;
    display: inline-block;
  }
  .red { background: #ff5f56; }
  .yellow { background: #ffbd2e; }
  .green { background: #27c93f; }

  .monitor-title {
    margin-left: 14px;
    font-family: monospace;
    color: #888;
    font-size: 0.9rem;
    flex-grow: 1;
  }

  .clear-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 0.8rem;
  }
  .clear-btn:hover { color: #fff; }

  .monitor-body {
    padding: 20px;
    height: 460px;
    overflow-y: auto;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 0.85rem;
  }

  .log-entry {
    margin-bottom: 12px;
    border-left: 2px solid transparent;
    padding-left: 12px;
    animation: slideIn 0.2s ease-out;
  }

  .log-entry.success { border-color: var(--success); }
  .log-entry.error { border-color: var(--danger); }

  .log-meta {
    display: flex;
    gap: 10px;
    margin-bottom: 4px;
  }

  .method { font-weight: bold; }
  .status { color: var(--text-muted); }

  .log-json {
    color: #a5b3ce;
    white-space: pre-wrap;
    background: rgba(255,255,255,0.05);
    padding: 8px;
    border-radius: 6px;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
`;
document.head.appendChild(style);

// ==========================================
// 6. Logic & Interactions
// ==========================================
const consoleOutput = document.getElementById('console-output')!;
const clearBtn = document.getElementById('btn-clear')!;

function log(method: string, url: string, status: number, data: any, time: number) {
  const isError = status >= 400;
  const color = isError ? 'var(--danger)' : 'var(--success)';
  const entry = document.createElement('div');
  entry.className = `log-entry ${isError ? 'error' : 'success'}`;

  entry.innerHTML = `
    <div class="log-meta">
      <span class="method" style="color: ${color}">${method}</span>
      <span style="color: #fff">${url}</span>
      <span class="status">Status: <b>${status}</b></span>
      <span class="status">Time: ${time}ms</span>
    </div>
    <div class="log-json">${JSON.stringify(data, null, 2)}</div>
  `;

  const placeholder = document.querySelector('.log-placeholder');
  if (placeholder) placeholder.remove();

  consoleOutput.prepend(entry);
}

async function request(method: string, url: string, body?: any) {
  const start = Date.now();
  try {
    let res;
    if (method === 'GET') res = await axios.get(url);
    else res = await axios.post(url, body);

    log(method, url, res.status, res.data, Date.now() - start);
  } catch (err: any) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { error: err.message };
    log(method, url, status, data, Date.now() - start);
  }
}

document.getElementById('btn-smart')!.addEventListener('click', () => request('GET', '/api/user/profile'));
document.getElementById('btn-list')!.addEventListener('click', () => request('GET', '/api/products/featured'));
document.getElementById('btn-error')!.addEventListener('click', () => request('GET', '/api/system/status'));

document.getElementById('btn-login')!.addEventListener('click', () => {
  const username = (document.getElementById('username') as HTMLInputElement).value;
  request('POST', '/api/auth/login', { username, password: 'any' });
});

clearBtn.addEventListener('click', () => {
  consoleOutput.innerHTML = '<div class="log-placeholder">// Console cleared. Waiting...</div>';
});