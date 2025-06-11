// scripts/fetch-leetcode.js
const { pushJson } = require("./utils/push-json.js");

const LEETCODE_USERNAME = "wlmr-rk";

const API_URL = "https://leetcode.com/graphql";

const QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

async function main() {
  try {
    console.log(`Fetching LeetCode stats for ${LEETCODE_USERNAME}...`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: LEETCODE_USERNAME },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`LeetCode API Error: ${data.errors[0].message}`);
    }

    const stats = data.data.matchedUser.submitStats.acSubmissionNum;
    const totalStats = data.data.allQuestionsCount;

    const processedData = {
      username: data.data.matchedUser.username,
      totalSolved: stats.find((s) => s.difficulty === "All").count,
      totalAvailable: totalStats.find((s) => s.difficulty === "All").count,
      easySolved: stats.find((s) => s.difficulty === "Easy").count,
      easyAvailable: totalStats.find((s) => s.difficulty === "Easy").count,
      mediumSolved: stats.find((s) => s.difficulty === "Medium").count,
      mediumAvailable: totalStats.find((s) => s.difficulty === "Medium").count,
      hardSolved: stats.find((s) => s.difficulty === "Hard").count,
      hardAvailable: totalStats.find((s) => s.difficulty === "Hard").count,
    };

    console.log("--- LeetCode Data ---");
    console.log(JSON.stringify(processedData, null, 2));
    await pushJson("leetcode-data.json", processedData);
  } catch (error) {
    console.error("Failed to fetch LeetCode data:", error.message);
  }
}

main();
