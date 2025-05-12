const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Setting up Anglican Project...");

// Create images directory
const imagesDir = path.join(__dirname, "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log("✅ Created images directory");
}

// Copy placeholder image creation script
try {
  console.log("📝 Creating placeholder images...");
  execSync("node scripts/create-placeholder-images.js");
  console.log("✅ Created placeholder images");
} catch (error) {
  console.error("❌ Error creating placeholder images:", error.message);
}

console.log("\n🎉 Setup completed! You can now run:");
console.log("  npm run dev");
console.log("\nTo start the development server and view the application.");
