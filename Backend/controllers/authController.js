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
// Stage 4:logout endpoint
const logout = async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(200).json({ message: "User logged out successfully" });
};

module.exports = {
  signup,
  login,
  logout,
};
