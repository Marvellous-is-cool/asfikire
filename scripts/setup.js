const fs = require("fs");
const path = require("path");
const https = require("https");
const { exec } = require("child_process");

// Define all assets we need
const ASSETS = [
  {
    url: "https://media.githubusercontent.com/media/pmndrs/drei-assets/master/models/tshirt.glb",
    dest: "public/t-shirt.glb",
    type: "model",
  },
  {
    url: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/fabric-normal.jpg",
    dest: "public/fabric-normal.jpg",
    type: "texture",
  },
  {
    url: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/fabric-rough.jpg",
    dest: "public/fabric-roughness.jpg",
    type: "texture",
  },
  {
    url: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/fonts/Montserrat-Bold.ttf",
    dest: "public/fonts/Montserrat-Bold.ttf",
    type: "font",
  },
  {
    url: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/fonts/Montserrat-Medium.ttf",
    dest: "public/fonts/Montserrat-Medium.ttf",
    type: "font",
  },
  {
    url: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/fonts/Montserrat-Italic.ttf",
    dest: "public/fonts/Montserrat-Italic.ttf",
    type: "font",
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

// Create a placeholder logo
const createPlaceholderLogo = () => {
  const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" fill="white" opacity="0.8"/>
    <path d="M100,50 L100,150 M50,100 L150,100" 
      stroke="black" stroke-width="20" stroke-linecap="round"/>
    <text x="100" y="180" text-anchor="middle" font-family="Arial" font-size="24">
      Anglican
    </text>
  </svg>`;

  fs.writeFileSync(
    path.join(__dirname, "..", "public", "anglican-logo.png"),
    svgContent
  );
  console.log("Created placeholder logo: anglican-logo.png");
};

// Download assets
let downloadCount = 0;
let totalAssets = ASSETS.length;

ASSETS.forEach((asset) => {
  const filePath = path.join(__dirname, "..", asset.dest);

  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`${asset.dest} already exists, skipping download.`);
    downloadCount++;
    if (downloadCount === totalAssets) {
      console.log("All assets are ready!");
    }
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
          downloadCount++;
          if (downloadCount === totalAssets) {
            console.log("All assets are ready!");
          }
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

          // If this is the logo, create a placeholder
          if (asset.dest.includes("anglican-logo.png")) {
            createPlaceholderLogo();
          }

          downloadCount++;
          if (downloadCount === totalAssets) {
            console.log("Setup complete with some errors.");
          }
        });
      }
    })
    .on("error", (err) => {
      file.close();

      // Fix: Added callback function to fs.unlink
      fs.unlink(filePath, (err2) => {
        if (err2)
          console.error(`Error removing failed download: ${err2.message}`);

        // If this is the logo, create a placeholder
        if (asset.dest.includes("anglican-logo.png")) {
          createPlaceholderLogo();
        }

        downloadCount++;
        if (downloadCount === totalAssets) {
          console.log("Setup complete with some errors.");
        }
      });

      console.error(`Error downloading ${asset.url}: ${err.message}`);
    });
});

// Create a simple Anglican logo if it doesn't exist
if (!fs.existsSync(path.join(__dirname, "..", "public", "anglican-logo.png"))) {
  createPlaceholderLogo();
}

console.log("Setup initiated! Downloading all required assets...");
