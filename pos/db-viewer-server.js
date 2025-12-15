const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.static('public'));

// Rutas
app.get('/api/db-structure', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'ESTRUCTURA_BASE_DATOS.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'No se pudo leer el archivo',
      message: error.message 
    });
  }
});

// Servir HTML con visualizador
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Estructura Base de Datos - POS</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          min-height: 100vh;
          color: #e2e8f0;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        header {
          margin-bottom: 2rem;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          color: #94a3b8;
          font-size: 1.1rem;
        }
        
        .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }
        
        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .btn-secondary {
          background-color: #8b5cf6;
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #7c3aed;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        
        .loading {
          text-align: center;
          padding: 3rem;
          background: rgba(30, 41, 59, 0.8);
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
        }
        
        .spinner {
          display: inline-block;
          width: 3rem;
          height: 3rem;
          border: 4px solid rgba(148, 163, 184, 0.3);
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fca5a5;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-top: 2rem;
        }
        
        .content {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 0.75rem;
          padding: 2rem;
          backdrop-filter: blur(10px);
          overflow-x: auto;
        }
        
        pre {
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
          color: #cbd5e1;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 0.5rem;
          padding: 1.5rem;
          text-align: center;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #60a5fa;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 1.75rem;
          }
          
          .controls {
            flex-direction: column;
          }
          
          button {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>📊 Estructura de Base de Datos</h1>
          <p class="subtitle">Sistema POS - Documentación Completa</p>
        </header>
        
        <div class="controls">
          <button class="btn-primary" onclick="downloadFile()">📥 Descargar TXT</button>
          <button class="btn-secondary" onclick="window.print()">🖨️ Imprimir</button>
        </div>
        
        <div id="stats" class="stats"></div>
        
        <div id="loading" class="loading">
          <div class="spinner"></div>
          <p>Cargando contenido...</p>
        </div>
        
        <div id="content" class="content" style="display: none;">
          <pre id="text-content"></pre>
        </div>
        
        <div id="error" class="error" style="display: none;"></div>
      </div>
      
      <script>
        async function loadContent() {
          try {
            const response = await fetch('/api/db-structure');
            if (!response.ok) throw new Error('No se pudo cargar el contenido');
            
            const data = await response.json();
            const content = data.content;
            
            document.getElementById('text-content').textContent = content;
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
            
            // Extraer estadísticas
            const lines = content.split('\\n');
            const summaryLine = lines.findIndex(l => l.includes('RESUMEN DE TABLAS'));
            if (summaryLine >= 0) {
              const statsLines = lines.slice(summaryLine + 3).filter(l => l.includes(': '));
              const totalTablas = statsLines.length;
              const totalRegistros = statsLines.reduce((acc, line) => {
                const match = line.match(/(\\d+) registros/);
                return acc + (match ? parseInt(match[1]) : 0);
              }, 0);
              
              document.getElementById('stats').innerHTML = \`
                <div class="stat-card">
                  <div class="stat-value">\${totalTablas}</div>
                  <div class="stat-label">Tablas</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">\${totalRegistros.toLocaleString()}</div>
                  <div class="stat-label">Total de Registros</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">\${(content.length / 1024).toFixed(1)} KB</div>
                  <div class="stat-label">Tamaño del Documento</div>
                </div>
              \`;
            }
          } catch (error) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = \`❌ Error: \${error.message}\`;
            console.error(error);
          }
        }
        
        function downloadFile() {
          const content = document.getElementById('text-content').textContent;
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ESTRUCTURA_BASE_DATOS.txt';
          a.click();
          URL.revokeObjectURL(url);
        }
        
        // Cargar al iniciar
        loadContent();
      </script>
    </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✓ DB Viewer disponible en http://localhost:${PORT}`);
  console.log(`✓ API en http://localhost:${PORT}/api/db-structure`);
});
