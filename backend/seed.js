require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Problem = require('./models/Problem');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing from .env');
  process.exit(1);
}

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');

    const seedFile = path.join(__dirname, 'problems_seed.json');
    if (!fs.existsSync(seedFile)) {
      console.error('problems_seed.json not found!');
      process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
    console.log(`Loaded ${rawData.length} problems from seed file.`);

    const existingCount = await Problem.countDocuments();
    console.log(`Current problems in database: ${existingCount}`);

    if (existingCount === 0) {
      console.log('Database empty. Inserting 500 curated problems...');
      await Problem.insertMany(rawData);
      console.log('Successfully inserted 500 problems!');
    } else {
      console.log(`Database already has ${existingCount} problems. Checking if refresh is requested...`);
      if (process.argv.includes('--force')) {
        console.log('Force flag detected. Clearing existing problems and reseeding...');
        await Problem.deleteMany({});
        await Problem.insertMany(rawData);
        console.log('Reseed completed successfully!');
      } else {
        console.log('Skipping seed. Use `node seed.js --force` if you want to overwrite.');
      }
    }

    const total = await Problem.countDocuments();
    const sheet1 = await Problem.countDocuments({ sheet: 'Top 300 FAANG Roadmap' });
    const sheet2 = await Problem.countDocuments({ sheet: 'Advanced 200 (Trees, Graphs, DP)' });
    console.log(`Database verification -> Total: ${total}, Sheet 1: ${sheet1}, Sheet 2: ${sheet2}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
