const express = require('express');
const cors = require('cors');
const feedbackRoutes = require('./routes/feedbackRoutes');
const courseRoutes = require('./routes/courseRoutes');
const { unknownRoute, serverError } = require('./middleware/errorHandlers');

function buildApp({ allowedOrigins = '*', logRequests = false } = {}) {
  const app = express();
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: '20kb' }));
  if (logRequests) {
    app.use((req, res, next) => {
      const started = Date.now();
      res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`));
      next();
    });
  }
  app.get('/', (req, res) => res.json({ status: 'ok', service: 'Feedback Admin API' }));
  app.use('/api/courses', courseRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use(unknownRoute);
  app.use(serverError);
  return app;
}
module.exports = buildApp;