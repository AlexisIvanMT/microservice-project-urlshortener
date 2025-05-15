require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Archivos estáticos
app.use('/public', express.static(`${process.cwd()}/public`));

// Importar rutas desde myApp.js
const router = require('./myApp');
app.use('/', router);

// Configuración básica
const port = process.env.PORT || 3000;

// Iniciar servidor
app.listen(port, function() {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});