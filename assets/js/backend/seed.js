const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

require('dotenv').config();
const mongoose = require('mongoose');

// Define Schema
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  type: String,
  salary: Number,
  description: String,
  postedAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

// The Jobs to Insert
const seedJobs = [
  {
    title: "Senior Full Stack Developer",
    company: "LeapFroggr Inc.",
    location: "Manila, Philippines",
    type: "Remote",
    salary: 80000,
    description: "We are looking for a Senior Full Stack Developer to join our growing team. You will work on high-impact projects."
  },
  {
    title: "Solutions Engineer",
    company: "AboitizPower",
    location: "Makati, Philippines",
    type: "Hybrid",
    salary: 60000,
    description: "Responsible for providing technical solutions and support to our enterprise clients."
  }
];

const seedDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    // 2. Connect
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    // 3. Clear old data
    await Job.deleteMany({});
    console.log('🧹 Cleared old jobs...');

    // 4. Insert new jobs
    await Job.insertMany(seedJobs);
    console.log('🎉 Success! Added jobs to HunterSiteDB.');

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    // 5. Close connection
    mongoose.connection.close();
    console.log('👋 Connection closed.');
  }
};

seedDB();