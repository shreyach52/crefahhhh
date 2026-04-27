import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
  ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
  : null;

if (!firebaseConfig) {
  console.error("Error: NEXT_PUBLIC_FIREBASE_CONFIG not found in .env.local");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cities = [
  "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", 
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"
];

const jobTypes = ["Salaried", "Freelancer", "Gig Worker", "Self-Employed"];

// Approximate rejection delta (%) based on job type and city variability
const getBaseDelta = (jobType: string) => {
  switch (jobType) {
    case "Salaried": return 0;
    case "Freelancer": return 8.5;
    case "Gig Worker": return 12.2;
    case "Self-Employed": return 6.4;
    default: return 0;
  }
};

const seed = async () => {
  console.log("🚀 Starting community patterns seeding...");
  
  const colRef = collection(db, 'community_patterns');

  // Clear existing patterns for these cities if they exist (optional, but good for clean seed)
  // For this script, we'll just add new ones or you could clear first.
  
  for (const city of cities) {
    for (const jobType of jobTypes) {
      const baseDelta = getBaseDelta(jobType);
      // Add some city-specific randomness (+/- 2%)
      const rejection_delta = parseFloat((baseDelta + (Math.random() * 4 - 2)).toFixed(2));
      
      const pattern = {
        city,
        jobType,
        rejection_delta: rejection_delta < 0 ? 0 : rejection_delta,
        updatedAt: new Date().toISOString(),
        source: "RBI 2023 Survey Proxy"
      };

      try {
        await addDoc(colRef, pattern);
        console.log(`✅ Seeded ${city} - ${jobType}: ${rejection_delta}%`);
      } catch (e) {
        console.error(`❌ Error seeding ${city}:`, e);
      }
    }
  }

  console.log("✨ Seeding complete!");
  process.exit(0);
};

seed();
