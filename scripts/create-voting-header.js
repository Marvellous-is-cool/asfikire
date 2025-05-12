const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

// Create the directory if it doesn't exist
const imagesDir = path.join(__dirname, "..", "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log("Created images directory");
}

// Create a canvas
const width = 1920;
const height = 500;
const canvas = createCanvas(width, height);
const context = canvas.getContext("2d");

// Fill the background with a gradient
const gradient = context.createLinearGradient(0, 0, 0, height);
gradient.addColorStop(0, "#722F37"); // Wine color
gradient.addColorStop(1, "#501f26"); // Darker wine
context.fillStyle = gradient;
context.fillRect(0, 0, width, height);

// Add some design elements
context.fillStyle = "rgba(255, 255, 255, 0.1)";
for (let i = 0; i < 20; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const size = Math.random() * 100 + 50;
  context.beginPath();
  context.arc(x, y, size, 0, Math.PI * 2);
  context.fill();
}

// Add text
context.fillStyle = "#ffffff";
context.font = "bold 60px Arial";
context.textAlign = "center";
context.fillText("VOTE FOR YOUR FAVORITE COLOR", width / 2, height / 2);

context.font = "30px Arial";
context.fillText(
  "Anglican Student Fellowship - Color Vote",
  width / 2,
  height / 2 + 60
);

// Save the image
const buffer = canvas.toBuffer("image/jpeg");
fs.writeFileSync(path.join(imagesDir, "voting-header.jpg"), buffer);
console.log("Created voting-header.jpg");
