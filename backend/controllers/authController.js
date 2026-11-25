const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah pernah ada' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Email dan password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email dan password salah' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin,
        email_reminder_enabled: user.email_reminder_enabled,
        warning_km_threshold: user.warning_km_threshold
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'is_admin', 'email_reminder_enabled', 'warning_km_threshold']
    });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email_reminder_enabled, warning_km_threshold } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    if (name !== undefined && name.trim() !== '') {
      user.name = name.trim();
    }
    if (email_reminder_enabled !== undefined) {
      user.email_reminder_enabled = Boolean(email_reminder_enabled);
    }
    if (warning_km_threshold !== undefined) {
      const threshold = parseInt(warning_km_threshold, 10);
      if (isNaN(threshold) || threshold < 0) {
        return res.status(400).json({ error: 'Batas KM peringatan tidak valid' });
      }
      user.warning_km_threshold = threshold;
    }

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
      email_reminder_enabled: user.email_reminder_enabled,
      warning_km_threshold: user.warning_km_threshold
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password lama dan password baru wajib diisi' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password saat ini salah' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
