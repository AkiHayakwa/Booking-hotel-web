// === Controller: Auth ===
var User = require('../schemas/User');

// POST /api/auth/register
module.exports.register = async (req, res) => {
  // TODO: Implement register logic
  res.status(200).json({ message: 'register - TODO' });
};

// POST /api/auth/login
module.exports.login = async (req, res) => {
  // TODO: Implement login logic
  res.status(200).json({ message: 'login - TODO' });
};

// POST /api/auth/change-password
module.exports.changePassword = async (req, res) => {
  // TODO: Implement change password logic
  res.status(200).json({ message: 'changePassword - TODO' });
};

// GET /api/auth/profile
module.exports.getProfile = async (req, res) => {
  // TODO: Implement get profile logic
  res.status(200).json({ message: 'getProfile - TODO' });
};
