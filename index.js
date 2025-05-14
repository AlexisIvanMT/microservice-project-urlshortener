require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const dns = require('dns');
const urlParser = require('url'); // Para extraer el hostname

// Configuración básica
const port = process.env.PORT || 3000;

// Base de datos simple en memoria
const urlDatabase = {};
let urlCounter = 1;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Archivos estáticos
app.use('/public', express.static(`${process.cwd()}/public`));

// Ruta principal
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Función definitiva para validar URL
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

// Ruta POST: Acortar URL
app.post('/api/shorturl', function(req, res) {
  const inputUrl = req.body.url?.trim();

  try {
    const parsedUrl = new URL(inputUrl);

    // Solo aceptar http o https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    // Validar que el hostname resuelve con DNS
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = inputUrl;

      res.json({ original_url: inputUrl, short_url: shortUrl });
    });

  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// Ruta GET: Redirigir
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);

  if (isNaN(shortUrl)) {
    return res.status(400).json({ error: 'Invalid short URL format' });
  }

  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(302, originalUrl); // Redirección explícita
  } else {
    return res.status(404).json({ error: 'No short URL found for given input' });
  }
});

// Iniciar servidor
app.listen(port, function() {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});