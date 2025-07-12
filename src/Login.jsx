import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserProvider";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);
  const { loginUser, isAuthenticated, isAuthLoading } = useUser();
  const navigate = useNavigate();

  // ✅ Check if user is already logged in on component mount
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated()) {
      console.log("✅ User already authenticated, redirecting to dashboard...");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const response = await loginUser(credentials);

    if (response.success) {
      setMessage({ type: "success", text: "✅ Login Successful!" });
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    } else {
      setMessage({ type: "danger", text: `❌ ${response.error}` });
    }
  };

  // Show loading while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-5 overflow-hidden" 
           style={{background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'}}>
        <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md text-white p-8" 
             style={{
               boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(44, 83, 100, 0.5)'
             }}>
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-white/80">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-5 overflow-hidden" 
         style={{background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'}}>
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md text-white p-8" 
           style={{
             boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(44, 83, 100, 0.5)'
           }}>
        <h2 className="text-center text-2xl font-bold mb-5 text-white" 
            style={{textShadow: '0 0 8px rgba(0, 255, 255, 0.4)'}}>
          Welcome Back 👋 
        </h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            message.type === "success" 
              ? "bg-green-500/20 text-green-300 border border-green-500/30" 
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2 text-left">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-none text-white placeholder-white/50 
                         focus:bg-white/15 focus:outline-none transition-all duration-300"
              style={{
                border: 'none',
                transition: '0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.boxShadow = '0 0 12px rgba(0, 255, 255, 0.6)';
                e.target.style.border = '1px solid #00e6e6';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
                e.target.style.border = 'none';
              }}
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2 text-left">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-none text-white placeholder-white/50 
                         focus:bg-white/15 focus:outline-none transition-all duration-300"
              style={{
                border: 'none',
                transition: '0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.boxShadow = '0 0 12px rgba(0, 255, 255, 0.6)';
                e.target.style.border = '1px solid #00e6e6';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
                e.target.style.border = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 px-4 font-bold border-none rounded-xl text-white 
                       transition-all duration-300 ease-in-out"
            style={{
              background: 'linear-gradient(90deg, #00e6e6, #6a5acd)',
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(106, 90, 205, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8), 0 0 30px rgba(106, 90, 205, 0.6)';
              e.target.style.background = 'linear-gradient(90deg, #5de6de, #b58ecc)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(106, 90, 205, 0.4)';
              e.target.style.background = 'linear-gradient(90deg, #00e6e6, #6a5acd)';
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;