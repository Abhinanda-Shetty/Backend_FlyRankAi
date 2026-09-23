// Stage 4: auth middleware
const supabase = require("../supabase.config");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization; // Bearer <token>
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  // Stage 3: profile route token verification
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.user = data.user;
  next();
};

module.exports = authMiddleware;
