exports.filterByUser = (req, res, next) => {
  if (req.user) req.filter = { user: req.user.id };
  next();
};
