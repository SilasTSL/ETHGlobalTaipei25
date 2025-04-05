export default function sessionMiddleware(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      error: 'Authentication required - No user found in session',
    })
  }
  next()
}
