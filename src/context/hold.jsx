import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

const BASE_URL = "https://api-e5q6islzdq-uc.a.run.app";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true); // New loading state
  const [theme, setTheme] = useState("light"); // 🌗 Theme state

  // Change Password State - Initialize first
  const [formData, setFormData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Load user from localStorage on first load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setEmail(parsedUser.email);
        setFormData((prev) => ({ ...prev, email: parsedUser.email }));
        console.log("✅ User loaded from localStorage:", parsedUser.email);
      } catch (error) {
        console.error("❌ Error parsing saved user:", error);
        localStorage.removeItem("user"); // Clear corrupted data
      }
    }
    setIsAuthLoading(false); // Auth loading complete
  }, []);

  // Update formData when email changes
  useEffect(() => {
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [email]);

  // Fetch user role when email is set
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!email) return;
      try {
        const res = await fetch(`${BASE_URL}/role/${email}`);
        const data = await res.json();

        if (res.ok) {
          setRole(data.role);
          console.log("✅ Role fetched:", data.role);
        } else {
          console.error("❌ Role fetch failed:", data.error);
        }
      } catch (err) {
        console.error("🚨 Error fetching role:", err.message);
      }
    };

    fetchUserRole();
  }, [email]);

  const validateUserData = ({ name, email, password }) => {
    if (!name || name.trim().length < 2) {
      return { valid: false, error: "Name must be at least 2 characters" };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { valid: false, error: "Invalid email format" };
    }
    if (!password || password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }
    return { valid: true };
  };

  const registerUser = async (userData) => {
    const validation = validateUserData(userData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error or server issue" };
    }
  };

  const loginUser = async (credentials) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Store user data with timestamp for potential expiration
        const userData = {
          ...credentials,
          loginTime: new Date().toISOString()
        };
        
        setUser(userData);
        setEmail(credentials.email);
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ User logged in and saved to localStorage");
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || "Invalid credentials" };
      }
    } catch (error) {
      return { success: false, error: "Network error or server issue" };
    }
  };

  const logout = () => {
    setUser(null);
    setEmail("");
    setRole("");
    setFormData({
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    localStorage.removeItem("user");
    console.log("✅ User logged out and localStorage cleared");
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!email;
  };

  // Change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler for password change
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password changed successfully ✅");
        setFormData((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setMessage(data.error || "Password change failed ❌");
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  //theme changer
  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };
  useEffect(() => {
    document.documentElement.className = theme; // Apply theme to <html>
  }, [theme]);


  return (
    <UserContext.Provider
      value={{
        user,
        email,
        role,
        isAuthLoading, // New loading state
        isAuthenticated, // New helper function
        loginUser,
        registerUser,
        logout,
        formData,
        handleChange,
        handleChangePasswordSubmit,
        isLoading,
        message,
        theme, 
        toggleTheme
      }}
    >
      {children}
    </UserContext.Provider>
  );
};