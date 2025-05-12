const fs = require("fs");
const path = require("path");
const https = require("https");

const ASSETS = [
  {
    url: "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/t-shirt/model.gltf",
    dest: "public/t-shirt.glb", // Direct in public folder
    type: "model",
  },
  {
    url: "https://3dtextures.me/wp-content/uploads/2019/02/Fabric_Cotton_001_normal.jpg",
    dest: "public/fabric-normal.jpg", // Direct in public folder
    type: "texture",
  },
  {
    url: "https://3dtextures.me/wp-content/uploads/2019/02/Fabric_Cotton_001_roughness.jpg",
    dest: "public/fabric-roughness.jpg", // Direct in public folder
    type: "texture",
  },
];

// Ensure directories exist
const dirs = ["public", "public/fonts"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Download assets
ASSETS.forEach((asset) => {
  const filePath = path.join(__dirname, "..", asset.dest);

  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`${asset.dest} already exists, skipping download.`);
    return;
  }

  console.log(`Downloading ${asset.type}: ${asset.url}`);

  const file = fs.createWriteStream(filePath);
  https
    .get(asset.url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`Downloaded ${asset.dest}`);
        });
      } else {
        console.error(
          `Failed to download ${asset.url}: HTTP ${response.statusCode}`
        );
        file.close();

        // Fix: Added callback function to fs.unlink
        fs.unlink(filePath, (err) => {
          if (err)
            console.error(`Error removing failed download: ${err.message}`);
        });
      }
    })
    .on("error", (err) => {
      file.close();

      // Fix: Added callback function to fs.unlink
      fs.unlink(filePath, (err2) => {
        if (err2)
          console.error(`Error removing failed download: ${err2.message}`);
      });

      console.error(`Error downloading ${asset.url}: ${err.message}`);
    });
});

// Create a sample Anglican logo in SVG format
const createSampleLogo = () => {
  const logoPath = path.join(__dirname, "..", "public", "anglican-logo.png");
  if (!fs.existsSync(logoPath)) {
    console.log("Creating sample Anglican logo...");
    const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="#1642d8" opacity="0.9"/>
      <path d="M100,40 L100,160 M60,100 L140,100" 
        stroke="white" stroke-width="20" stroke-linecap="round"/>
      <text x="100" y="190" text-anchor="middle" font-family="Arial" font-size="18" fill="white">
        Anglican Fellowship
      </text>
    </svg>`;

    fs.writeFileSync(logoPath, svgContent);
    console.log("Created sample Anglican logo");
  }
};

// Call the logo creation function
createSampleLogo();

console.log(
  "Setup complete! Please download Montserrat font files manually from Google Fonts."
);
