const cds = require('@sap/cds');

// Configure CORS at the server level - this runs before CAP processes routes
cds.on('bootstrap', (app) => {
  console.log('CORS middleware configured in server.js');
  
  // Handle ALL OPTIONS requests for ALL routes - MUST be first
  app.all('*', (req, res, next) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS preflight request received:', req.url);
      const requestedHeaders = req.headers['access-control-request-headers'];
      console.log('Requested headers:', requestedHeaders);
      
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3009');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Echo back the exact headers the browser requested (case-sensitive fix)
      if (requestedHeaders) {
        console.log('Echoing back requested headers:', requestedHeaders);
        res.setHeader('Access-Control-Allow-Headers', requestedHeaders);
      } else {
        console.log('Using default headers');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
      }
      
      res.setHeader('Access-Control-Max-Age', '86400');
      res.status(204).end();
      return; // Don't call next() for OPTIONS
    }
    
    // For all other requests, set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3009');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    next();
  });
});

module.exports = cds.server;

