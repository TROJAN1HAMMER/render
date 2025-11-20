const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const app = express();
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { swaggerUi, swaggerSpec } = require('./swagger');

dotenv.config();

const corsOptions = {
  origin: '*', // Your fixed frontend port
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.disable('etag'); // put this in your main app.js

// Rate-Limiters
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit 100 req per 15 mins
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use(routes);
app.use(errorHandler);

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
module.exports = app;
