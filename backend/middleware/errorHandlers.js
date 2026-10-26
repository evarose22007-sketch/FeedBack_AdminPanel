exports.unknownRoute = (req, res) => {
  res.status(404).json({ message: `Route is not found: ${req.method} ${req.originalUrl}` });
};
exports.serverError = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The requested body isnt a valid JSON.' });
  }
  console.error(err);
  res.status(500).json({ message: 'this is a Server error. Please try again later.' });
};
