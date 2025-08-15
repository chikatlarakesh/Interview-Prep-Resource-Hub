const { fetchGitHubResources } = require('./utils/githubFetcher');

(async () => {
  try {
    const data = await fetchGitHubResources();
    console.log("Fetched resources:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching GitHub resources:", err);
  }
})();
