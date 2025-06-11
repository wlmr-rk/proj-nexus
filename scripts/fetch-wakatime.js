// scripts/fetch-wakatime.js
const { pushJson } = require("./utils/push-json.js");

require("dotenv").config();

const API_KEY = process.env.WAKATIME_API_KEY;
const API_ROOT = "https://wakatime.com/api/v1/users/current";

const basicAuth = Buffer.from(`${API_KEY}:`).toString("base64");

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`WakaTime API Error (${res.status}): ${message}`);
  }
  return res.json();
}

async function getTodaysSummary() {
  const today = new Date().toISOString().split("T")[0];
  return fetchJson(`${API_ROOT}/summaries?start=${today}&end=${today}`);
}

async function getLast7Days() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const start = weekAgo.toISOString().split("T")[0];
  const end = today.toISOString().split("T")[0];
  return fetchJson(`${API_ROOT}/summaries?start=${start}&end=${end}`);
}

async function main() {
  try {
    console.log("Fetching WakaTime highlights...");

    const [todaysSummary, last7Days] = await Promise.all([
      getTodaysSummary().catch(() => null),
      getLast7Days().catch(() => null),
    ]);

    let processedData = {
      lastUpdated: new Date().toISOString(),
      status: "Active Developer",
    };

    // Today's highlight
    if (todaysSummary?.data?.[0]) {
      const today = todaysSummary.data[0];
      const minutes = Math.round(today.grand_total.total_seconds / 60);

      processedData.today = {
        codingMinutes: minutes,
        primaryLanguage: today.languages[0]?.name || "Various",
        environment: {
          editor: today.editors[0]?.name || "Unknown",
          os: today.operating_systems[0]?.name || "Unknown",
        },
      };
    }

    // Weekly consistency (the real flex)
    if (last7Days?.data) {
      const totalSeconds = last7Days.data.reduce(
        (sum, day) => sum + day.grand_total.total_seconds,
        0,
      );
      const activeDays = last7Days.data.filter(
        (day) => day.grand_total.total_seconds > 0,
      ).length;
      const avgDaily = totalSeconds / 7 / 60; // minutes per day

      // Get top 2 languages across the week
      const languageTotals = {};
      last7Days.data.forEach((day) => {
        day.languages.forEach((lang) => {
          languageTotals[lang.name] =
            (languageTotals[lang.name] || 0) + lang.total_seconds;
        });
      });

      const topLanguages = Object.entries(languageTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([name, seconds]) => ({
          name,
          percentage: ((seconds / totalSeconds) * 100).toFixed(1),
        }));

      processedData.weeklyStats = {
        totalHoursLast7Days: (totalSeconds / 3600).toFixed(1),
        activeDaysCount: activeDays,
        dailyAverageMinutes: Math.round(avgDaily),
        languages: {
          primary: topLanguages[0]?.name || "Various",
          secondary: topLanguages[1]?.name || null,
          primaryPercentage: topLanguages[0]?.percentage || "0.0",
          secondaryPercentage: topLanguages[1]?.percentage || "0.0",
        },
        consistency:
          activeDays >= 5 ? "High" : activeDays >= 3 ? "Good" : "Building",
      };
    }

    console.log("--- WakaTime Professional Summary ---");
    console.log(JSON.stringify(processedData, null, 2));
    await pushJson("wakatime-data.json", processedData);
  } catch (err) {
    console.error("Failed to fetch WakaTime data:", err.message);
  }
}

main();
