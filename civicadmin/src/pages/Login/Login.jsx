// src/pages/Login/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/api";

const Login = () => {
  const [credentials, setCredentials] = useState({
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    phone: false,
    password: false,
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate("/");
    }

    // Check for saved phone if "remember me" was checked previously
    const savedPhone = localStorage.getItem("rememberedPhone");
    if (savedPhone) {
      setCredentials((prev) => ({ ...prev, phone: savedPhone }));
      setRememberMe(true);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone field, only allow numbers and limit to 10 digits
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setCredentials((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setCredentials((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate phone number format
    if (credentials.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setIsLoading(false);
      return;
    }

    try {
      // Save phone if "remember me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberedPhone", credentials.phone);
      } else {
        localStorage.removeItem("rememberedPhone");
      }

      // Make API call directly - FIXED THIS PART
      const result = await loginUser(credentials);
      
      // The API function returns the data directly, not wrapped in response.data
      const { user, sessionId } = result;
      
      // Store auth data
      localStorage.setItem('authToken', sessionId);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      // The error is already a string message from the API function
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    let demoCredentials = {};

    switch (role) {
      case "admin":
        demoCredentials = {
          phone: "9876543210",
          password: "admin123",
        };
        break;
      case "officer":
        demoCredentials = {
          phone: "9123456780",
          password: "officer123",
        };
        break;
      case "citizen":
        demoCredentials = {
          phone: "9988776655",
          password: "citizen123",
        };
        break;
      default:
        return;
    }

    setCredentials(demoCredentials);
    setError(null);
  };

  // ... (rest of the JSX remains exactly the same)
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D69D7] via-[#2563EB] to-[#F8FAFC]">
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-cyan-400/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm bg-white/5 border border-white/10">
          {/* Left Panel - Branding */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-600/90 via-indigo-600/90 backdrop-blur-xl p-8 text-white flex flex-col justify-center relative">
            {/* Decorative elements */}
            <div className="absolute top-6 right-6 w-20 h-20 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 border border-white/20 rounded-full"></div>

            <div className="text-center md:text-left relative z-10">
              <div className="flex justify-center md:justify-start mb-6">
                <div
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30"
                  aria-hidden="true"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    ></path>
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Civic Resolution
              </h1>
              <p className="text-blue-100 mb-8 text-lg">
                Jharkhand Government Platform
              </p>

              <p className="text-sm opacity-90 hidden md:block leading-relaxed">
                Streamlining public issue resolution with transparency and
                efficiency. Join us in building better communities together.
              </p>

              <div className="mt-10 hidden md:block space-y-4">
                <div className="flex items-center group">
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                    </svg>
                  </div>
                  <span className="text-white/90">
                    Real-time issue tracking
                  </span>
                </div>

                <div className="flex items-center group">
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-white/90">Transparent governance</span>
                </div>

                <div className="flex itemsCenter group">
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-white/90">
                    Citizen-officer collaboration
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="w-full md:w-3/5 bg-white/95 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center backdrop-blur-sm"
                role="alert"
              >
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="phone"
                  className={`absolute left-4 transition-all duration-300 ease-out ${
                    isFocused.phone || credentials.phone
                      ? "top-1 text-xs text-blue-600 font-medium"
                      : "top-4 text-sm text-gray-500"
                  }`}
                >
                  Phone Number
                </label>
                <div className="flex items-center">
                  <span className="absolute left-4 top-4 text-gray-500 text-sm">+91</span>
                  <input
                    id="phone"
                    className="w-full pl-12 pr-4 pt-6 pb-3 text-sm border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                    type="tel"
                    name="phone"
                    value={credentials.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus("phone")}
                    onBlur={() => handleBlur("phone")}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                    aria-required="true"
                    aria-describedby="phone-description"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
                <p id="phone-description" className="sr-only">
                  Enter your registered 10-digit phone number
                </p>
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className={`absolute left-4 transition-all duration-300 ease-out ${
                    isFocused.password || credentials.password
                      ? "top-1 text-xs text-blue-600 font-medium"
                      : "top-4 text-sm text-gray-500"
                  }`}
                >
                  Password
                </label>
                <input
                  id="password"
                  className="w-full px-4 pt-6 pb-3 text-sm border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 pr-12"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                  required
                  aria-required="true"
                  aria-describedby="password-description"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      ></path>
                    </svg>
                  )}
                </button>
                <p id="password-description" className="sr-only">
                  Enter your password
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 group-hover:border-blue-400 transition-colors"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="group-hover:text-gray-800 transition-colors">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled: cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
                aria-label={isLoading ? "Logging in" : "Log in"}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/60"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/95 text-gray-500 font-medium">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => fillDemoCredentials("admin")}
                className="py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transform hover:scale-105 active:scale-95 border border-gray-200 backdrop-blur-sm"
                aria-label="Fill admin demo credentials"
              >
                <span aria-hidden="true">👨‍💼</span> Admin
              </button>
              <button
                onClick={() => fillDemoCredentials("officer")}
                className="py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transform hover:scale-105 active:scale-95 border border-gray-200 backdrop-blur-sm"
                aria-label="Fill officer demo credentials"
              >
                <span aria-hidden="true">👮‍♂️</span> Officer
              </button>
              <button
                onClick={() => fillDemoCredentials("citizen")}
                className="py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transform hover:scale-105 active:scale-95 border border-gray-200 backdrop-blur-sm"
                aria-label="Fill citizen demo credentials"
              >
                <span aria-hidden="true">👤</span> Citizen
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/contact"
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200 hover:underline"
              >
                Contact administrator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;