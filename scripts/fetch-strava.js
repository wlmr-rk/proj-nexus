// scripts/fetch-strava.js
const { pushJson } = require("./utils/push-json.js");

require("dotenv").config(); // Load variables from .env file

// Read credentials securely from the environment
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://www.strava.com/oauth/token";
const ACTIVITIES_ENDPOINT = "https://www.strava.com/api/v3/athlete/activities";

async function getAccessToken() {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json();
  // Strava's API can sometimes return errors in a 'message' field
  if (data.message) {
    throw new Error(`Strava API Error: ${data.message}`);
  }
  return data.access_token;
}

async function getActivities(accessToken) {
  // Fetch last 30 activities. You can change per_page.
  const url = `${ACTIVITIES_ENDPOINT}?per_page=30`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return await response.json();
}

function processActivities(activities) {
  const runs = activities.filter((a) => a.type === "Run");
  const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);

  return {
    totalRuns: runs.length,
    totalDistanceKm: (totalDistance / 1000).toFixed(1),
    recentRuns: runs.slice(0, 3).map((run) => ({
      name: run.name,
      distanceKm: (run.distance / 1000).toFixed(1),
      date: run.start_date_local.split("T")[0],
    })),
  };
}

async function main() {
  try {
    console.log("Fetching Strava data...");
    const accessToken = await getAccessToken();
    const activities = await getActivities(accessToken);
    const processedData = processActivities(activities);

    console.log("--- Strava Data ---");
    console.log(JSON.stringify(processedData, null, 2));
    await pushJson("strava-data.json", processedData);
  } catch (error) {
    console.error("Failed to fetch Strava data:", error.message);
  }
}

main();
