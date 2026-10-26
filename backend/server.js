require('dotenv').config({ quiet: true });
const buildApp = require('./app');
const { connectDB, ensureCourses } = require('./config/db');
const { PORT = 5000, MONGODB_URI, CLIENT_URL = '*' } = process.env;
(async () => {
  if (!MONGODB_URI || MONGODB_URI.includes('<')) {
    console.error('Set MONGODB_URI in backend/.env to your MongoDB Atlas connection string.');
    process.exit(1);
  }
  try {
    await connectDB(MONGODB_URI);
    await ensureCourses();
  } catch (err) {
    console.error('Could not connect to MongoDB Atlas:', err.message);
    console.error('Check the connection string, the database user password, and Network Access in Atlas.');
    process.exit(1);
  }

  const origins = CLIENT_URL === '*' ? '*' : CLIENT_URL.split(',').map((o) => o.trim());
  buildApp({ allowedOrigins: origins, logRequests: true }).listen(PORT, () => {
    console.log(`Feedback API running on http://localhost:${PORT}`);
  });
})();