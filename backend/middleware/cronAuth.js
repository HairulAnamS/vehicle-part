const cronAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-cron-secret');
    
    if (!token || token !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized cron request.' });
    }
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized cron request.' });
  }
};

module.exports = cronAuth;
