// Importamos los paquetes necesarios
const express = require('express');
const bodyParser = require('body-parser');  // Requerimos body-parser
const path = require('path');
require('dotenv').config();  // Cargar variables de entorno desde el archivo .env

// Creamos una instancia de la aplicación Express
const app = express();

// Configuramos body-parser para analizar datos codificados por URL
app.use(bodyParser.urlencoded({ extended: false }));  // Analizar los datos en el formato application/x-www-form-urlencoded

// Middleware de registro de peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();  // Llamamos a next() para continuar con el siguiente middleware o ruta
});

// Ruta principal para servir el HTML con el formulario
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html')); // Asegúrate de que 'index.html' esté en la carpeta 'views'
});

// Ruta POST para /name (recibe los datos del formulario)
app.post('/name', (req, res) => {
  const firstName = req.body.first;
  const lastName = req.body.last;
  
  if (firstName && lastName) {
    res.json({ name: `${firstName} ${lastName}` });
  } else {
    res.status(400).json({ error: 'Por favor, proporciona un primer nombre y un apellido.' });
  }
});









module.exports = app;