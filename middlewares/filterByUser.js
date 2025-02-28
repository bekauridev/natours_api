exports.filterByUser = (req, res, next) => {
  if (req.user) req.filter = { user: req.user.id };
  next();
};

exports.setUserIdInParams = (req, res, next) => {
  if (req.user) {
    req.params.id = req.user.id; // Set the user ID in req.params
  }
  next();
};
