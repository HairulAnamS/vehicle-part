const { Sparepart, Replacement } = require('../models');

exports.getAllSpareparts = async (req, res) => {
  try {
    const spareparts = await Sparepart.findAll({ order: [['name', 'ASC']] });
    res.json(spareparts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSparepart = async (req, res) => {
  try {
    const { name, type } = req.body;
    const sparepart = await Sparepart.create({
      name,
      type: type || 'All'
    });
    res.status(201).json(sparepart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSparepart = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    const sparepart = await Sparepart.findByPk(id);
    if (!sparepart) {
      return res.status(404).json({ error: 'Sparepart not found' });
    }

    sparepart.name = name;
    if (type) sparepart.type = type;
    await sparepart.save();
    
    res.json(sparepart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSparepart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sparepart = await Sparepart.findByPk(id);
    if (!sparepart) {
      return res.status(404).json({ error: 'Sparepart not found' });
    }

    const replacementCount = await Replacement.count({ where: { sparepart_id: id } });
    if (replacementCount > 0) {
      return res.status(400).json({ error: 'Tidak dapat menghapus sparepart karena terdapat riwayat pergantian terkait.' });
    }

    await sparepart.destroy();
    res.json({ message: 'Sparepart deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
