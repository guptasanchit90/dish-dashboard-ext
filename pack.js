const fs = require("fs");
const manifest = require("./manifest.json");
const childProcess = require("child_process");

const version = process.argv[2];

if (!version) {
  console.error("Please provide a version number as an argument");
  process.exit(1);
}

create_zip("local", () => {
  delete manifest.key;
  create_zip("edge", () => {});
});

function create_zip(extType, callback) {
  manifest.version = version;
  manifest.externally_connectable.matches = ["https://dish-dashboard.web.app/"];

  fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));
  console.log("Updated Version in Manifest,json successfully!");

  childProcess
    .spawn("rm", [`dish-dashboard-ext-${version}.zip`], { stdio: "inherit" })
    .on("exit", (code) => {
      childProcess
        .spawn(
          "zip",
          [
            "-r",
            `out/${extType}-dish-dashboard-ext-${version}.zip`,
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
          childProcess
            .spawn("git", ["checkout", "HEAD", "--", "manifest.json"], {
              stdio: "inherit",
            })
            .on("exit", (code) => {
              callback();
            });
        });
    });
}
