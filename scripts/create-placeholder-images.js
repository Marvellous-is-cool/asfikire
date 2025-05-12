const fs = require("fs");
const path = require("path");

// Create images directory if it doesn't exist
const imagesDir = path.join(process.cwd(), "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log("Created images directory");
}

// List of placeholder images to create
const images = [
  "church-bg.jpg",
  "student-worship.jpg",
  "fellowship1.jpg",
  "fellowship2.jpg",
  "fellowship3.jpg",
  "fellowship4.jpg",
  "fellowship5.jpg",
  "fellowship6.jpg",
  "voting-header.jpg",
];

// Create a basic SVG for each image
images.forEach((imageName) => {
  const imagePath = path.join(imagesDir, imageName);

  // Skip if image already exists
  if (fs.existsSync(imagePath)) {
    console.log(`${imageName} already exists`);
    return;
  }

  // Generate a random background color
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  // Create SVG content with placeholder text
  const svgContent = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${getRandomColor()}" />
    <text x="400" y="300" font-family="Arial" font-size="32" text-anchor="middle" fill="#333">
      ${imageName}
    </text>
  </svg>`;

  // Write SVG to file
  fs.writeFileSync(imagePath, svgContent);
  console.log(`Created placeholder image: ${imageName}`);
});

console.log("All placeholder images created successfully!");
