const axios = require('axios');
require('dotenv').config();
const GITHUB_USERNAME = 'chikatlarakesh';
const REPO_NAME = 'Interview-Prep';
const githubBaseURL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents`;

// Add your token here (or better, store it in environment variable)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const axiosInstance = axios.create({
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    'User-Agent': 'axios'  // GitHub requires a user-agent header
  }
});

// Cache variables
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
let cachedResources = null;
let lastFetchTime = 0;

/**
 * Recursively fetches all files from a GitHub directory, excluding README.md
 */
const fetchAllFiles = async (url, basePath = '') => {
  const files = [];

  const response = await axiosInstance.get(url);
  const items = response.data;

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  }

  for (const item of items) {
    if (item.type === 'file' && item.name !== 'README.md') {
      files.push({
        name: `${basePath}${item.name}`,
        url: item.download_url,
        type: getFileExtension(item.name)
      });
    } else if (item.type === 'dir') {
      const nestedFiles = await fetchAllFiles(item.url, `${basePath}${item.name}/`);
      files.push(...nestedFiles);
    }
  }

  return files;
};

/**
 * Fetches categorized resources from the GitHub repo under 'Links' and 'Notes'
 * Uses caching to minimize API calls.
 */
const fetchGitHubResources = async () => {
  const now = Date.now();

  // Return cached data if it's still valid
  if (cachedResources && (now - lastFetchTime) < CACHE_TTL) {
    return cachedResources;
  }

  const result = [];

  const foldersResponse = await axiosInstance.get(githubBaseURL);

  const folders = foldersResponse.data.filter(item =>
    item.type === 'dir' && (item.name === 'Links' || item.name === 'Notes')
  );

  for (const folder of folders) {
    const files = await fetchAllFiles(folder.url);
    result.push({
      category: folder.name,
      files
    });
  }

  // Update cache
  cachedResources = result;
  lastFetchTime = now;

  return result;
};

module.exports = { fetchGitHubResources };
