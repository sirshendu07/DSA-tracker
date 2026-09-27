const http = require('http');

require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const problemRoutes = require('./routes/problemRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/problems', problemRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function testBackend() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');

    const server = app.listen(5002, async () => {
      console.log('Test server listening on port 5002');

      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(() => null);

      // Simple http get
      function get(path) {
        return new Promise((resolve, reject) => {
          http.get(`http://localhost:5002${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
          }).on('error', reject);
        });
      }

      try {
        const health = await get('/api/health');
        console.log('Health:', health);

        const analytics = await get('/api/analytics');
        console.log('Analytics summary:', analytics.data.summary);
        console.log('Daily Goal:', analytics.data.dailyGoal);
        console.log('Topics count:', analytics.data.topics.length);

        const problems = await get('/api/problems?sheet=all');
        console.log('Total problems fetched:', problems.count);

        console.log('All backend checks passed! Closing test server...');
        server.close();
        await mongoose.disconnect();
        process.exit(0);
      } catch (err) {
        console.error('Test error during requests:', err);
        server.close();
        await mongoose.disconnect();
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testBackend();
