# Project Nexus 🔗

**A serverless data aggregation pipeline that streams real-time telemetry from multiple APIs into a Next.js portfolio website.**

![Data Pipeline](https://img.shields.io/badge/Pipeline-Automated-brightgreen) ![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-blue) ![APIs](https://img.shields.io/badge/APIs-5%20Sources-orange) ![Uptime](https://img.shields.io/badge/Sync-Hourly-success)

---

## 🎯 Project Overview

Project Nexus automatically collects and synchronizes data from multiple platforms to power a dynamic portfolio website. It fetches coding activity, music listening habits, fitness data, and problem-solving progress—transforming personal metrics into compelling "building in public" content.

**Live Pipeline:** Runs every hour via GitHub Actions, pushing fresh JSON data to [wilmerlapuz.com](https://wilmerlapuz.com)

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │    │   proj-nexus     │    │  wilmerlapuz.com│
│                 │    │   (this repo)    │    │                 │
│ • Spotify API   │───▶│                  │───▶│  public/*.json  │
│ • Strava API    │    │  GitHub Actions  │    │                 │
│ • LeetCode API  │    │  Node.js Scripts │    │  Vercel Deploy  │
│ • WakaTime API  │    │  Hourly Cron     │    │                 │
│ • Anki Desktop  │    │                  │    │  Next.js Site   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Flow:**

1. **Fetch** → Scripts query APIs and local data sources
2. **Transform** → Clean, format, and optimize data for frontend consumption
3. **Sync** → Push JSON files to website repository
4. **Deploy** → Vercel automatically rebuilds site with fresh data

---

## 📊 Data Sources

| Service      | Data Collected                                  | Update Frequency | Auth Type            |
| ------------ | ----------------------------------------------- | ---------------- | -------------------- |
| **Spotify**  | Currently playing track, recent activity        | Hourly           | OAuth2 Refresh Token |
| **Strava**   | Recent runs, total distance, activity summary   | Hourly           | OAuth2 Refresh Token |
| **LeetCode** | Problems solved by difficulty, progress stats   | Hourly           | Public GraphQL API   |
| **WakaTime** | Daily coding time, language breakdown, streak   | Hourly           | API Key              |
| **Anki**     | Flashcard reviews, retention rate, study streak | On app close     | Local SQLite + Addon |

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- API credentials for each service

### Local Development

```bash
# Clone the repository
git clone https://github.com/wlmr-rk/proj-nexus.git
cd proj-nexus

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API credentials

# Test individual fetchers
node scripts/fetch-wakatime.js
node scripts/fetch-spotify.js
node scripts/fetch-strava.js
node scripts/fetch-leetcode.js

# Each script will:
# 1. Fetch data from the respective API
# 2. Write JSON to ~/Code/myWebsite/public/
# 3. Commit and push to GitHub (local only)
```

### Environment Variables

```bash
# Spotify
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token

# Strava
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REFRESH_TOKEN=your_refresh_token

# WakaTime
WAKATIME_API_KEY=your_api_key

# Local website path (for development)
WEBSITE_REPO_PATH=/path/to/your/website/repo
```

---

## ⚙️ Continuous Integration

The pipeline runs automatically via GitHub Actions:

```yaml
# Hourly execution
schedule:
  - cron: "0 * * * *" # Every hour at :00

# Manual execution
workflow_dispatch: true
```

**Workflow Steps:**

1. Checkout both repositories (proj-nexus + website)
2. Install Node.js dependencies
3. Execute all four fetcher scripts in parallel
4. Commit aggregated JSON changes to website repo
5. Trigger Vercel redeploy

**Monitoring:** Check the [Actions tab](../../actions) for pipeline status and logs.

---

## 📁 Project Structure

```
proj-nexus/
├── scripts/
│   ├── fetch-spotify.js       # Now playing + recent tracks
│   ├── fetch-strava.js        # Running activities + stats
│   ├── fetch-leetcode.js      # Problem-solving progress
│   ├── fetch-wakatime.js      # Coding time + language breakdown
│   └── utils/
│       └── push-json.js       # Shared git commit/push utility
├── .github/workflows/
│   └── data-sync.yml          # Hourly CI pipeline
├── NexusAnkiExporter/
│   └── __init__.py            # Anki addon (local-only)
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## 🔧 Technical Highlights

- **Resilient Error Handling:** API failures don't break the pipeline; individual fetchers fail gracefully
- **Concurrent Execution:** Multiple API calls run in parallel to minimize total sync time
- **Git Conflict Resolution:** Automatic rebase with stash to handle concurrent updates
- **Rate Limit Compliance:** Hourly schedule respects all API quotas
- **Environment Detection:** Scripts behave differently in CI vs local development
- **Zero-Downtime Deployment:** Vercel handles rolling updates automatically

---

## 📈 Output Format

Each fetcher produces clean, frontend-ready JSON:

```js
// wakatime-data.json
{
  "lastUpdated": "2025-06-11T12:30:00.000Z",
  "status": "Active Developer",
  "today": {
    "codingMinutes": 180,
    "primaryLanguage": "Rust"
  },
  "weeklyStats": {
    "totalHoursLast7Days": "28.5",
    "consistency": "High"
  }
}
```

```js
// spotify-data.json
{
  "isPlaying": true,
  "title": "The Less I Know The Better",
  "artist": "Tame Impala",
  "albumImageUrl": "https://...",
  "songUrl": "https://open.spotify.com/track/..."
}
```

---

## 🎯 Performance Metrics

- **Pipeline Duration:** ~2-3 minutes per run
- **API Success Rate:** >99% uptime across all services
- **Data Freshness:** Maximum 1-hour lag between real activity and website
- **Bundle Size:** Each JSON file <10KB, optimized for fast loading

---

## 🤝 Contributing

This is a personal portfolio project, but architecture feedback is welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Test your changes locally
4. Submit a pull request with detailed description

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🏆 Acknowledgments

Built as part of a "building in public" portfolio strategy while job hunting as a self-taught developer. Special thanks to the open-source community for excellent API documentation and GitHub Actions ecosystem.

**Tech Stack:** Node.js, GitHub Actions, Vercel, Multiple REST/GraphQL APIs  
**Author:** [Wilmer Lapuz](https://wilmerlapuz.com) - Aspiring Software Engineer  
**Status:** Production-ready, actively maintained

---

_"Automate everything, build in public, get hired." 🚀_
