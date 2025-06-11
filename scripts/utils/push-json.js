// utils/push-json.js
// One-liner API: await pushJson("spotify-data.json", processedData);

require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const WEBSITE_REPO_PATH = "/home/wlmr/Code/myWebsite";
const PUBLIC_DIR = path.join(WEBSITE_REPO_PATH, "public");

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function run(cmd, args, cwd) {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, { cwd, stdio: "pipe", text: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));

    child.on("error", rej);
    child.on("close", (code) => {
      if (code === 0) return res({ stdout, stderr });
      const err = new Error(
        `${cmd} ${args.join(" ")} exited with code ${code}`,
      );
      err.stdout = stdout;
      err.stderr = stderr;
      rej(err);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Main export                                                        */
/* ------------------------------------------------------------------ */

async function pushJson(fileName, data) {
  const target = path.join(PUBLIC_DIR, fileName);

  // 1️⃣  Write JSON (pretty, UTF-8, no ASCII escaping)
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.writeFile(target, JSON.stringify(data, null, 2), {
    encoding: "utf8",
  });
  console.log(`pushJson: wrote ${path.relative(WEBSITE_REPO_PATH, target)}`);

  // 2️⃣  Git routine (identical to Anki exporter)
  try {
    await run("git", ["add", target], WEBSITE_REPO_PATH);
    await run(
      "git",
      ["commit", "--allow-empty", "-m", `chore: update ${fileName}`],
      WEBSITE_REPO_PATH,
    );
    await run("git", ["pull", "--rebase", "--autostash"], WEBSITE_REPO_PATH);
    await run("git", ["push"], WEBSITE_REPO_PATH);
    console.log("pushJson: pushed to GitHub ✅");
  } catch (err) {
    const benign =
      err.stdout?.includes("nothing to commit") ||
      err.stdout?.includes("up to date");
    if (benign) {
      console.log("pushJson: no changes – nothing to push.");
    } else {
      console.error("pushJson: git error ⛔️");
      console.error("STDOUT:", err.stdout);
      console.error("STDERR:", err.stderr);
    }
  }
}

module.exports = { pushJson };

/* ------------------------------------------------------------------ */
/* Optional CLI (for local testing)                                   */
/* ------------------------------------------------------------------ */

if (require.main === module) {
  (async () => {
    const [file, sampleKey = "ok"] = process.argv.slice(2);
    if (!file) {
      console.log("Usage: node utils/push-json.js <fileName> [value]");
      process.exit(1);
    }
    await pushJson(file, { sample: sampleKey, at: new Date().toISOString() });
  })();
}
