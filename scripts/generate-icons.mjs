import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Source SVG — icon-512 (regular)
const svgRegular = readFileSync(join(root, "public/icons/icon-512.svg"));
const svgMaskable = readFileSync(join(root, "public/icons/icon-512m.svg"));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

mkdirSync(join(root, "public/icons"), { recursive: true });
mkdirSync(join(root, "resources/android"), { recursive: true });
mkdirSync(join(root, "resources/ios"), { recursive: true });

async function generate() {
  // PWA icons
  for (const size of sizes) {
    await sharp(svgRegular).resize(size, size).png().toFile(join(root, `public/icons/icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  // Maskable (for Android adaptive icons)
  await sharp(svgMaskable).resize(512, 512).png().toFile(join(root, "public/icons/icon-512m.png"));
  await sharp(svgMaskable).resize(192, 192).png().toFile(join(root, "public/icons/icon-192m.png"));
  console.log("✓ maskable icons");

  // Capacitor / Android resources
  const androidSizes = [
    { name: "icon-mdpi", size: 48 },
    { name: "icon-hdpi", size: 72 },
    { name: "icon-xhdpi", size: 96 },
    { name: "icon-xxhdpi", size: 144 },
    { name: "icon-xxxhdpi", size: 192 },
    { name: "icon-foreground", size: 432 }, // adaptive icon foreground
  ];
  for (const { name, size } of androidSizes) {
    await sharp(svgRegular).resize(size, size).png().toFile(join(root, `resources/android/${name}.png`));
    console.log(`✓ android/${name}.png`);
  }
  await sharp(svgMaskable).resize(432, 432).png().toFile(join(root, "resources/android/icon-foreground-maskable.png"));

  // Capacitor / iOS resources
  const iosSizes = [
    { name: "icon-20", size: 20 },
    { name: "icon-20@2x", size: 40 },
    { name: "icon-20@3x", size: 60 },
    { name: "icon-29", size: 29 },
    { name: "icon-29@2x", size: 58 },
    { name: "icon-29@3x", size: 87 },
    { name: "icon-40", size: 40 },
    { name: "icon-40@2x", size: 80 },
    { name: "icon-40@3x", size: 120 },
    { name: "icon-60@2x", size: 120 },
    { name: "icon-60@3x", size: 180 },
    { name: "icon-76", size: 76 },
    { name: "icon-76@2x", size: 152 },
    { name: "icon-83.5@2x", size: 167 },
    { name: "icon-1024", size: 1024 }, // App Store
  ];
  for (const { name, size } of iosSizes) {
    await sharp(svgRegular).resize(size, size).png().toFile(join(root, `resources/ios/${name}.png`));
    console.log(`✓ ios/${name}.png`);
  }

  console.log("\n✅ Toutes les icônes générées dans public/icons/, resources/android/, resources/ios/");
}

generate().catch(err => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
