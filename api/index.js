const app = require('../app'); // Import the Express app

module.exports = (req, res) => {
  app(req, res); // Handle requests with Express
};
