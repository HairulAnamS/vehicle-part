const { User } = require('../models');

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat melakukan aksi ini.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = adminAuth;
