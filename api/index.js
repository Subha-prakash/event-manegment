import app from '../server/src/index.js';

export default function handler(req, res) {
  // Ensure the request URL has the /api prefix expected by express routes
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
