const supabase = require("../supabase.config");
// Endpoint: /auth/signup
const signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json({ message: "User created successfully", data });
};
// Endpoint: /auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  res.status(200).json({ message: "User logged in successfully", data });
};
// Endpoint: /auth/logout
const logout = async (req, res) => {
  const token = req.cookies["supabase-auth-token"];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const { error: setSessionError } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: token, // If you track refresh tokens, supply it here; otherwise match access_token
  });
  if (setSessionError) {
    return res.status(400).json({ error: setSessionError.message });
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.clearCookie("supabase-auth-token");
  res.status(200).json({ message: "User logged out successfully" });
};

module.exports = {
  signup,
  login,
  logout,
};
