require('dotenv').config();
const dns = require('dns');
// Use Cloudflare DNS as fallback for SRV lookups
dns.setServers(['1.1.1.1', '1.0.0.1']);

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const eventsRouter = require('./routes/event');
const trialRequestsRouter = require('./routes/trialRequests');
const authRouter = require('./routes/auth');

const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/events', eventsRouter);
app.use('/api/trial-requests', trialRequestsRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = { app };