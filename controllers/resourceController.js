const cache = require('../cache/cache'); // shared instance
const { fetchGitHubResources } = require('../utils/githubFetcher');

const getResources = async (req, res) => {
  try {
    const cachedData = cache.get("githubResources");
    if (cachedData) {
      console.log("🚀 Serving from cache");
      return res.status(200).json(cachedData);
    }

    const data = await fetchGitHubResources();
    cache.set("githubResources", data);

    console.log("📦 Fresh data fetched and cached");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching GitHub resources:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchResources = async (req, res) => {
    try {
      // Get query params
      const { q, category } = req.query;
  
      // Fetch all resources (cached layer still works if you use the cache in the route)
      const allResources = await fetchGitHubResources();
  
      // Filter by category if provided
      let filtered = allResources;
      if (category) {
        filtered = filtered.filter(cat => cat.category.toLowerCase() === category.toLowerCase());
      }
  
      // Filter by search query if provided (search in filenames)
      if (q) {
        filtered = filtered.map(cat => {
          const matchedFiles = cat.files.filter(file => file.name.toLowerCase().includes(q.toLowerCase()));
          return { ...cat, files: matchedFiles };
        }).filter(cat => cat.files.length > 0); // remove categories with no matched files
      }
  
      return res.status(200).json(filtered);
    } catch (error) {
      console.error('Error searching resources:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

module.exports = { getResources,searchResources };
