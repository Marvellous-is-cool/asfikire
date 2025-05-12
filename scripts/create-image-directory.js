const fs = require("fs");
const path = require("path");

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, "..", "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log("Created images directory at", imagesDir);
}

// Create a basic placeholder image for voting-header.jpg
const placeholderImagePath = path.join(imagesDir, "voting-header.jpg");
if (!fs.existsSync(placeholderImagePath)) {
  // Copy an existing image or create a placeholder
  try {
    const sourceImage = path.join(__dirname, "..", "public", "logo.png");
    if (fs.existsSync(sourceImage)) {
      fs.copyFileSync(sourceImage, placeholderImagePath);
      console.log("Created voting-header.jpg placeholder from logo");
    } else {
      // Create a minimal placeholder file
      fs.writeFileSync(placeholderImagePath, "Placeholder Image");
      console.log("Created minimal voting-header.jpg placeholder");
    }
  } catch (error) {
    console.error("Error creating placeholder image:", error);
  }
}

// Create fellowship2.jpg placeholder
const fellowship2Path = path.join(__dirname, "..", "public", "fellowship2.jpg");
if (!fs.existsSync(fellowship2Path)) {
  try {
    const sourceImage = path.join(__dirname, "..", "public", "logo.png");
    if (fs.existsSync(sourceImage)) {
      fs.copyFileSync(sourceImage, fellowship2Path);
      console.log("Created fellowship2.jpg placeholder from logo");
    } else {
      // Create a minimal placeholder file
      fs.writeFileSync(fellowship2Path, "Placeholder Image");
      console.log("Created minimal fellowship2.jpg placeholder");
    }
  } catch (error) {
    console.error("Error creating fellowship2.jpg placeholder:", error);
  }
}

console.log("Image directory and placeholders setup complete");
