/**
 * 3D Shirt SVG Generator
 * Creates front and back views of shirts in wine, white, and green colors
 * For Anglican Students Fellowship, Ikire Branch
 */

class ShirtDesigner {
  constructor() {
    this.colors = {
      wine: "#722F37",
      white: "#FFFFFF",
      black: "#000000", // Updated from green to black
    };

    this.scriptures = [
      {
        verse:
          "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
        reference: "Jeremiah 29:11",
      },
      {
        verse: "I can do all things through Christ who strengthens me.",
        reference: "Philippians 4:13",
      },
      {
        verse:
          "Trust in the LORD with all your heart and lean not on your own understanding.",
        reference: "Proverbs 3:5",
      },
      {
        verse: "The LORD is my shepherd; I shall not want.",
        reference: "Psalm 23:1",
      },
      {
        verse:
          "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        reference: "John 3:16",
      },
    ];
  }

  getRandomScripture() {
    const randomIndex = Math.floor(Math.random() * this.scriptures.length);
    return this.scriptures[randomIndex];
  }

  createShirtFront(color) {
    const colorCode = this.colors[color];
    const darkShade =
      color === "white" ? "#e0e0e0" : this.darkenColor(colorCode, 30);
    const lightShade =
      color === "white" ? "#f8f8f8" : this.lightenColor(colorCode, 15);

    return `
      <svg width="500" height="600" viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg">
        <!-- 3D Shirt Front -->
        <defs>
          <linearGradient id="shirt-gradient-${color}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${colorCode};stop-opacity:0.8" />
            <stop offset="50%" style="stop-color:${colorCode};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colorCode};stop-opacity:0.9" />
          </linearGradient>
          
          <!-- Modern neck rib texture -->
          <linearGradient id="neck-rib-${color}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${darkShade};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${colorCode};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${darkShade};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Shirt Body -->
        <path d="M150,100 C150,80 200,50 250,50 C300,50 350,80 350,100 L380,150 L400,300 L350,320 L350,550 L150,550 L150,320 L100,300 L120,150 Z" 
              fill="url(#shirt-gradient-${color})" stroke="#000000" stroke-width="2" />
        
        <!-- Modern Round Neck Design -->
        <!-- Neck opening - more elliptical and natural -->
        <path d="M215,90 C215,65 285,65 285,90 C285,110 250,125 215,90" 
              fill="${darkShade}" stroke="#000000" stroke-width="1.5" />
              
        <!-- Neck Rib/Collar - with realistic thickness -->
        <path d="M200,95 C200,75 250,60 300,95 C280,105 250,115 220,105 C210,102 202,100 200,95Z" 
              fill="url(#neck-rib-${color})" stroke="#000000" stroke-width="1" stroke-opacity="0.7" />
              
        <!-- Collar stitching detail -->
        <path d="M205,92 C220,75 270,70 295,92" 
              fill="none" stroke="${
                color === "white" ? "#ddd" : "#000"
              }" stroke-width="0.7" stroke-opacity="0.5" stroke-dasharray="2,1" />
        
        <!-- Shoulder seams -->
        <path d="M150,105 L170,85 M350,105 L330,85" 
              fill="none" stroke="${
                color === "white" ? "#ddd" : "#000"
              }" stroke-width="0.7" stroke-opacity="0.5" stroke-dasharray="2,1" />
        
        <!-- Sleeves shading to create 3D effect -->
        <path d="M150,100 L100,300 L150,320" fill="none" stroke="#000000" stroke-opacity="0.3" stroke-width="1" />
        <path d="M350,100 L400,300 L350,320" fill="none" stroke="#000000" stroke-opacity="0.3" stroke-width="1" />
        
        <!-- Logo Placeholder - Will be imported -->
        <circle cx="210" cy="160" r="30" fill="${
          color === "white" ? "#EEE" : "#FFF"
        }" fill-opacity="0.3" stroke="#000" stroke-width="1" />
        <path d="M210,130 L210,190 M180,160 L240,160" stroke="${
          color === "white" ? "#333" : "#FFF"
        }" stroke-width="4" stroke-linecap="round"/>
        
        <!-- Text: Anglican Students Fellowship -->
        <text x="250" y="250" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="${
          color === "white" ? "#333333" : "#FFFFFF"
        }">Anglican Students Fellowship</text>
        
        <!-- Text: Ikire Branch -->
        <text x="250" y="280" font-family="Arial" font-size="16" text-anchor="middle" fill="${
          color === "white" ? "#333333" : "#FFFFFF"
        }">Ikire Branch</text>
        
        <!-- Motto -->
        <text x="250" y="310" font-family="Arial" font-size="14" font-style="italic" text-anchor="middle" fill="${
          color === "white" ? "#333333" : "#FFFFFF"
        }">"Arise, Shine!"</text>
      </svg>
    `;
  }

  createShirtBack(color) {
    const colorCode = this.colors[color];
    const darkShade =
      color === "white" ? "#e0e0e0" : this.darkenColor(colorCode, 30);
    const scripture = this.getRandomScripture();

    return `
      <svg width="500" height="600" viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg">
        <!-- 3D Shirt Back -->
        <defs>
          <linearGradient id="shirt-back-gradient-${color}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${colorCode};stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:${colorCode};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colorCode};stop-opacity:0.8" />
          </linearGradient>
          
          <!-- Neck rib texture for back view -->
          <linearGradient id="neck-rib-back-${color}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${darkShade};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${colorCode};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${darkShade};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Shirt Body -->
        <path d="M150,100 C150,80 200,50 250,50 C300,50 350,80 350,100 L380,150 L400,300 L350,320 L350,550 L150,550 L150,320 L100,300 L120,150 Z" 
              fill="url(#shirt-back-gradient-${color})" stroke="#000000" stroke-width="2" />
        
        <!-- Modern Round Neck Design - Back View -->
        <!-- Neck opening - back view is more subtle -->
        <path d="M215,80 C215,72 285,72 285,80 C275,85 225,85 215,80" 
              fill="${darkShade}" stroke="#000000" stroke-width="1.5" />
              
        <!-- Neck Rib/Collar from back -->
        <path d="M205,85 C205,75 295,75 295,85 C285,88 215,88 205,85Z" 
              fill="url(#neck-rib-back-${color})" stroke="#000000" stroke-width="1" stroke-opacity="0.7" />
              
        <!-- Collar stitching detail -->
        <path d="M210,83 C230,80 270,80 290,83" 
              fill="none" stroke="${
                color === "white" ? "#ddd" : "#000"
              }" stroke-width="0.7" stroke-opacity="0.5" stroke-dasharray="2,1" />
              
        <!-- Tag/Label in the back -->
        <rect x="245" y="85" width="10" height="15" rx="1" ry="1" fill="${
          color === "white" ? "#ddd" : "#555"
        }" />
        
        <!-- Sleeves shading for 3D effect -->
        <path d="M150,100 L100,300 L150,320" fill="none" stroke="#000000" stroke-opacity="0.3" stroke-width="1" />
        <path d="M350,100 L400,300 L350,320" fill="none" stroke="#000000" stroke-opacity="0.3" stroke-width="1" />
        
        <!-- Scripture Text -->
        <text x="250" y="220" font-family="Arial" font-size="14" font-style="italic" text-anchor="middle" fill="${
          color === "white" ? "#333333" : "#FFFFFF"
        }">
          "${
            scripture.verse.length > 60
              ? scripture.verse.substring(0, 60) + "..."
              : scripture.verse
          }"
        </text>
        <text x="250" y="250" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="${
          color === "white" ? "#333333" : "#FFFFFF"
        }">
          ${scripture.reference}
        </text>
      </svg>
    `;
  }

  // Color utility functions for shading
  darkenColor(hex, percent) {
    // Remove the # if present
    hex = hex.replace("#", "");

    // Convert to RGB
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    // Darken
    r = Math.floor((r * (100 - percent)) / 100);
    g = Math.floor((g * (100 - percent)) / 100);
    b = Math.floor((b * (100 - percent)) / 100);

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  lightenColor(hex, percent) {
    // Remove the # if present
    hex = hex.replace("#", "");

    // Convert to RGB
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    // Lighten
    r = Math.min(255, Math.floor((r * (100 + percent)) / 100));
    g = Math.min(255, Math.floor((g * (100 + percent)) / 100));
    b = Math.min(255, Math.floor((b * (100 + percent)) / 100));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  generateAllShirts() {
    const shirts = {};

    for (const color in this.colors) {
      shirts[color] = {
        front: this.createShirtFront(color),
        back: this.createShirtBack(color),
      };
    }

    return shirts;
  }

  // Export SVG as string
  exportSVG(color = "wine", view = "front") {
    const colorHex = this.colors[color] || this.colors.wine;

    if (view === "front") {
      return this.createShirtFront(color);
    } else if (view === "back") {
      return this.createShirtBack(color);
    }
    return null;
  }
}

export default ShirtDesigner;
