const fs = require("fs");
const manifest = require("./manifest.json");
const childProcess = require("child_process");

const version = process.argv[2];

if (!version) {
    console.error('Please provide a version number as an argument');
    process.exit(1);
  }

manifest.version = version;
fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));
console.log("Updated Version in Manifest,json successfully!");

childProcess
  .spawn("rm", [`dish-dashboard-ext-${version}.zip`], { stdio: "inherit" })
  .on("exit", (code) => {
    if (code === 0) {
      console.log("ZIP archive deleted successfully!");
    } else {
      console.error(`Error removing ZIP archive: ${code}`);
    }

    childProcess
      .spawn(
        "zip",
        [
          "-r",
          `dish-dashboard-ext-${version}.zip`,
          ".",
          "-x",
          "*/node_modules/*",
          "-x",
          ".git/*",
          "-x",
          "*.log",
          "-x",
          "*.tmp",
          "-x",
          "*.yml",
          "-x",
          ".*",
          "-x",
          "*.md",
          "-x",
          "pack.js",
          "-x",
          "*.zip",
        ],
        { stdio: "inherit" }
      )
      .on("exit", (code) => {
        if (code === 0) {
          console.log("ZIP archive created successfully!");
        } else {
          console.error(`Error creating ZIP archive: ${code}`);
        }
      });
  });
