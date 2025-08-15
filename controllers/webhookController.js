const NodeCache = require('node-cache');
const cache = require('../cache/cache'); // assuming your cache is exported from a common file

const handleGitHubWebhook = async (req, res) => {
    try {
      console.log('📩 Payload:', JSON.stringify(req.body, null, 2)); // show full payload
  
      // Clear the cache
      cache.del('githubResources');
  
      return res.status(200).json({ message: 'Webhook received and cache cleared' });
    } catch (error) {
      console.error('❌ Error in webhook handler:', error);
      return res.status(500).json({ message: 'Server error in webhook handler' });
    }
  };  

module.exports = { handleGitHubWebhook };