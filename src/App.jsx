import { useState, useEffect, useRef } from "react";
import Logo from "./assets/Logo.png";
import Logo1 from "./assets/Logo_1.png";
const STEPS = [
  { label: "STEP 1",     desc: "Enter your first and last name to get started." },
  { label: "STEP 2",     desc: "Add your phone number for account verification." },
  { label: "STEP 3",     desc: "Provide your university email address." },
  { label: "STEP 4",     desc: "Create a strong password to secure your account." },
  { label: "FINAL STEP", desc: "Review your info and confirm to create your account." },
];

const COUNTRY_CODES = [
  { flag: "🇪🇬", code: "+20" },
  { flag: "🇸🇦", code: "+966" },
  { flag: "🇦🇪", code: "+971" },
  { flag: "🇺🇸", code: "+1" },
  { flag: "🇬🇧", code: "+44" },
];

const EyeIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function TruthEye() {
  const [page, setPage] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [rememberMe, setRememberMe] = useState(true);
  const [receiveEmails, setReceiveEmails] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "" });
  const [signupPassword, setSignupPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginStudentId, setLoginStudentId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSubmitted, setLoginSubmitted] = useState(false);
  const [signupSubmitted, setSignupSubmitted] = useState(false);

  const passwordChecks = {
    length:    signupPassword.length >= 8,
    lowercase: /[a-z]/.test(signupPassword),
    uppercase: /[A-Z]/.test(signupPassword),
    number:    /[0-9]/.test(signupPassword),
    special:   /[^a-zA-Z0-9]/.test(signupPassword),
  };
  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

  const loginValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail) &&
    loginStudentId.trim().length > 0 &&
    loginPassword.length > 0;

  const signupValid =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    allPasswordChecksPassed;
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateField = (field, value) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    const stepReady = [
      newForm.firstName.trim() && newForm.lastName.trim(),
      newForm.phone.trim(),
      newForm.email.trim(),
      newForm.password.length >= 8,
      true,
    ];
    if (stepReady[currentStep] && currentStep < STEPS.length - 1) {
      setTimeout(() => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1)), 300);
    }
  };

  const goToSignup = () => { setPage("signup"); setCurrentStep(0); setForm({ firstName: "", lastName: "", phone: "", email: "", password: "" }); setSignupPassword(""); setSignupSubmitted(false); };
  const goToLogin  = () => { setPage("login"); setCurrentStep(0); setLoginEmail(""); setLoginStudentId(""); setLoginPassword(""); setLoginSubmitted(false); };
  const goToForgot = () => setPage("forgot");

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!showIdentityModal) stopCamera();
  }, [showIdentityModal]);

  const handleAllow = async () => {
    setScanning(true);
    setScanProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
    }
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setScanning("done");
        setIdentityVerified(true);
      }
    }, 80);
  };

  // Responsive layout calculations
  const LOGIN_CARD_TOP_MARGIN = 40;  // ✏️ تحكم في موقع كارد الـ Login
  const SIGNUP_CARD_TOP_MARGIN = 40;  // ✏️ تحكم في موقع كارد الـ Sign Up
  const isDesktop = windowWidth >= 1080;

  // Side panel positioning — only shown on desktop
  const rightGap   = isDesktop ? Math.max(0, (windowWidth - 800) / 2) : 0;
  const logoSize   = Math.min(264, Math.max(140, rightGap * 0.75));
  const logoLeft   = `calc(50% + 400px + ${(rightGap - logoSize) / 2}px)`;
  const stepsWidth = Math.min(240, Math.max(140, rightGap * 0.80));
  const stepsLeft  = `calc(50% + 400px + ${(rightGap - stepsWidth) / 2}px)`;

  const inputStyle = { borderColor: "#9E9E9E", color: "#333", fontSize: "14px", backgroundColor: "#FFFAFA", padding: "12px 16px" };

  return (
    <div
      className="relative w-full flex flex-col"
      style={{ backgroundColor: "#FFFAFA", height: "100vh", overflowX: "hidden", overflowY: "hidden" }}
    >
      {/* Triangle background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 90 1290 910" preserveAspectRatio="none">
          <polygon points="1300,80 1600,700 -6,1001" fill="#1C5332" />
        </svg>
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-8" style={{ paddingTop: "clamp(6px, 1.5vh, 16px)", paddingBottom: "clamp(6px, 1.5vh, 16px)", flexShrink: 0 }}>
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className="overflow-hidden flex items-center justify-center"
            style={{ width: "clamp(36px, 5vw, 72px)", height: "clamp(36px, 5vw, 72px)" }}
          >
            <img src={Logo} alt="TruthEye Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold tracking-tight" style={{ fontSize: "clamp(18px, 3.5vw, 36px)" }}>
            <span style={{ color: "#1C5332" }}>Truth</span>
            <span style={{ color: "#F3B300" }}>Eye</span>
          </span>
        </div>

        <div className="relative z-20 flex items-center gap-2 md:gap-4">
          {page === "login" ? (
            <>
              <span style={{ color: "#424242", fontSize: "clamp(11px, 1.4vw, 14px)", whiteSpace: "nowrap" }}>
                No Account yet?
              </span>
              <button
                onClick={goToSignup}
                className="font-bold border-2 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
                style={{
                  borderColor: "#212121", color: "#212121", backgroundColor: "#FCFCFC", cursor: "pointer",
                  fontSize: "clamp(11px, 1.4vw, 14px)",
                  padding: "6px clamp(10px, 1.8vw, 24px)",
                  height: "clamp(34px, 4.5vw, 48px)",
                  whiteSpace: "nowrap",
                }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <span style={{ color: "#424242", fontSize: "clamp(11px, 1.4vw, 14px)", whiteSpace: "nowrap" }}>
                Already a Member?
              </span>
              <button
                onClick={goToLogin}
                className="font-bold border-2 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
                style={{
                  borderColor: "#212121", color: "#212121", backgroundColor: "#FCFCFC", cursor: "pointer",
                  fontSize: "clamp(11px, 1.4vw, 14px)",
                  padding: "6px clamp(10px, 1.8vw, 24px)",
                  height: "clamp(34px, 4.5vw, 48px)",
                  whiteSpace: "nowrap",
                }}
              >
                Log In
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Main content ── */}
      <div
        className="relative z-10 flex items-center justify-center px-4 sm:px-6"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", marginTop: `${page === "signup" ? SIGNUP_CARD_TOP_MARGIN : LOGIN_CARD_TOP_MARGIN}px`, paddingBottom: page === "signup" && !isDesktop ? "80px" : "16px", paddingTop: "8px" }}
      >
        {/* Card container — max 800px, centered */}
        <div className="relative w-full" style={{ maxWidth: "800px", minHeight: 0 }}>

          {/* ════ LOGIN CARD ════ */}
          {page === "login" && (
            <div
              className="bg-[#FFFAFA] rounded-2xl w-full"
              style={{
                padding: "clamp(10px, 2.5vh, 40px) clamp(20px, 8vw, 80px)",
                boxShadow: "0 0px 15px rgba(0,0,0,0.20)",
              }}
            >
              <div className="text-center" style={{ marginBottom: "clamp(8px, 2vh, 28px)" }}>
                <h1 className="mb-1" style={{ color: "#1a1a1a", fontSize: "clamp(16px, 3vh, 34px)" }}>
                  Welcome to{" "}
                  <span style={{ fontWeight: "bold", color: "#1C5332" }}>Truth</span>
                  <span style={{ fontWeight: "bold", color: "#F3B300" }}>Eye</span>
                  <span style={{ fontWeight: "bold", color: "#1C2933" }}>!</span>
                </h1>
                <p style={{ color: "#1a1a1a", fontSize: "clamp(13px, 2.2vh, 24px)" }}>Log in into your account</p>
              </div>
              <div className="flex flex-col" style={{ gap: "clamp(6px, 1.2vh, 12px)" }}>
                {/* Email */}
                <div>
                  <input
                    type="email" placeholder="Enter your university email" value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                    style={{
                      ...inputStyle,
                      borderColor: loginSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail) ? "#e53e3e" : "#9E9E9E",
                    }}
                    onFocus={e => (e.target.style.borderColor = loginSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail) ? "#e53e3e" : "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = loginSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail) ? "#e53e3e" : "#9E9E9E")}
                  />
                  {loginSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail) && (
                    <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px" }}>
                      {loginEmail.trim() === "" ? "Email is required" : "Please enter a valid email address"}
                    </p>
                  )}
                </div>
                {/* Student ID */}
                <div>
                  <input
                    type="text" placeholder="Enter your student ID" value={loginStudentId}
                    onChange={e => setLoginStudentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                    style={{
                      ...inputStyle,
                      borderColor: loginSubmitted && loginStudentId.trim() === "" ? "#e53e3e" : "#9E9E9E",
                    }}
                    onFocus={e => (e.target.style.borderColor = loginSubmitted && loginStudentId.trim() === "" ? "#e53e3e" : "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = loginSubmitted && loginStudentId.trim() === "" ? "#e53e3e" : "#9E9E9E")}
                  />
                  {loginSubmitted && loginStudentId.trim() === "" && (
                    <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px" }}>Student ID is required</p>
                  )}
                </div>
                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} placeholder="Enter your password"
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all pr-12"
                    style={{
                      ...inputStyle,
                      borderColor: loginSubmitted && loginPassword === "" ? "#e53e3e" : "#9E9E9E",
                    }}
                    onFocus={e => (e.target.style.borderColor = loginSubmitted && loginPassword === "" ? "#e53e3e" : "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = loginSubmitted && loginPassword === "" ? "#e53e3e" : "#9E9E9E")}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  {loginSubmitted && loginPassword === "" && (
                    <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px" }}>Password is required</p>
                  )}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginTop: "clamp(2px, 0.4vh, 6px)" }}>
                  <label className="flex items-center gap-2 cursor-pointer select-none" style={{ fontSize: "14px", color: "#333" }}>
                    <div
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex items-center justify-center border-2 rounded transition-all"
                      style={{
                        width: "20px", height: "20px", minWidth: "20px",
                        backgroundColor: rememberMe ? "#1C5332" : "white",
                        borderColor: rememberMe ? "#1C5332" : "#aaa",
                        cursor: "pointer",
                      }}
                    >
                      {rememberMe && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    Remember Me
                  </label>
                  <button
                    type="button" onClick={goToForgot}
                    className="text-sm hover:underline"
                    style={{ color: "#333", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <p style={{ color: "#666", fontSize: "clamp(10px, 1.2vh, 12px)", marginTop: "clamp(2px, 0.4vh, 6px)" }}>
                  By Creating an Account, it means you agree to our{" "}
                  <span className="underline cursor-pointer" style={{ color: "#1C5332" }}>Privacy Policy</span>{" "}
                  and <span className="underline cursor-pointer" style={{ color: "#1C5332" }}>Terms of Service</span>
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => { setLoginSubmitted(true); if (loginValid) { /* proceed */ } }}
                    className="w-full py-3 rounded-xl font-bold text-[#FFFAFA] mt-2 transition-all hover:opacity-90 hover:scale-[1.01]"
                    style={{
                      backgroundColor: "#1C5332",
                      fontSize: "16px",
                      cursor: "pointer",
                      border: "none", width: "min(100%, 400px)", height: "clamp(36px, 5.5vh, 48px)",
                    }}
                  >
                    Log in
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ FORGOT PASSWORD CARD ════ */}
          {page === "forgot" && (
            <div
              className="bg-[#FFFAFA] rounded-2xl w-full"
              style={{
                padding: "clamp(32px, 5vw, 56px) clamp(20px, 8vw, 80px)",
                boxShadow: "0 0px 15px rgba(0,0,0,0.20)",
              }}
            >
              <div className="text-center mb-6">
                <h1 className="font-bold mb-3" style={{ color: "#1a1a1a", fontSize: "clamp(20px, 3.5vw, 36px)" }}>
                  Reset Password
                </h1>
                <p style={{ color: "#666", fontSize: "clamp(13px, 1.8vw, 16px)", lineHeight: "1.5" }}>
                  Type your authorised email to receive reset password link.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <input
                  type="email" placeholder="Enter your university email" value={form.email}
                  onChange={e => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1C5332")}
                  onBlur={e => (e.target.style.borderColor = "#9E9E9E")}
                />
                <div className="flex justify-center">
                  <button
                    onClick={() => setPage("verify")}
                    className="py-3 rounded-xl font-bold text-[#FFFAFA] transition-all hover:opacity-90 hover:scale-[1.01]"
                    style={{
                      backgroundColor: "#1C5332", fontSize: "15px", cursor: "pointer",
                      border: "none", width: "100%", height: "48px",
                    }}
                  >
                    Send Reset Password Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ VERIFY CODE CARD ════ */}
          {page === "verify" && (
            <div
              className="bg-[#FFFAFA] rounded-2xl w-full"
              style={{
                padding: "clamp(32px, 5vw, 56px) clamp(20px, 8vw, 80px)",
                boxShadow: "0 0px 15px rgba(0,0,0,0.20)",
              }}
            >
              <div className="text-center mb-8">
                <h1 className="font-bold mb-3" style={{ color: "#1a1a1a", fontSize: "clamp(20px, 3.5vw, 36px)" }}>
                  Verify Your Code
                </h1>
                <p style={{ color: "#666", fontSize: "clamp(13px, 1.8vw, 16px)", lineHeight: "1.6" }}>
                  Enter the passcode you just received on your email address ending with *******in@gmail.com
                </p>
              </div>
              {/* OTP inputs */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/, "");
                      const newOtp = [...otp];
                      newOtp[i] = val;
                      setOtp(newOtp);
                      if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === "Backspace" && !otp[i] && i > 0)
                        document.getElementById(`otp-${i - 1}`)?.focus();
                    }}
                    className="text-center font-bold rounded-lg border-2 outline-none transition-all"
                    style={{
                      width: "clamp(36px, 10vw, 56px)",
                      height: "clamp(36px, 10vw, 56px)",
                      fontSize: "clamp(16px, 3vw, 24px)",
                      borderColor: digit ? "#F3B300" : "#9E9E9E",
                      color: "#1a1a1a",
                      backgroundColor: "#FFFAFA",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (otp.every(d => d !== "")) {
                      setPage("create_password");
                      setOtp(["", "", "", "", "", ""]);
                    }
                  }}
                  className="py-3 rounded-xl font-bold text-[#FFFAFA] transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: otp.every(d => d !== "") ? "#1C5332" : "#aaa",
                    fontSize: "15px",
                    cursor: otp.every(d => d !== "") ? "pointer" : "not-allowed",
                    border: "none",
                    width: "100%",
                    height: "48px",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* ════ CREATE NEW PASSWORD CARD ════ */}
          {page === "create_password" && (
            <div
              className="bg-[#FFFAFA] rounded-2xl w-full"
              style={{
                padding: "clamp(32px, 5vw, 56px) clamp(20px, 8vw, 80px)",
                boxShadow: "0 0px 15px rgba(0,0,0,0.20)",
              }}
            >
              <div className="text-center mb-6">
                <h1 className="font-bold mb-3" style={{ color: "#1a1a1a", fontSize: "clamp(20px, 3.5vw, 36px)" }}>
                  Create New Password
                </h1>
                <p style={{ color: "#666", fontSize: "clamp(13px, 1.8vw, 16px)", lineHeight: "1.6" }}>
                  Type your new strong password. Your password must include: One capital letter &amp; one small letter at least, One special character &amp; Minimum 8 digits long.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all pr-12"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = "#9E9E9E")}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password"
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all pr-12"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = "#9E9E9E")}
                  />
                  <button
                    type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="flex justify-center mt-2">
                  <button
                    onClick={goToLogin}
                    className="py-3 rounded-xl font-bold text-[#FFFAFA] transition-all hover:opacity-90 hover:scale-[1.01]"
                    style={{
                      backgroundColor: "#1C5332", fontSize: "15px", cursor: "pointer",
                      border: "none", width: "100%", height: "48px",
                    }}
                  >
                    Confirm Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ SIGN UP CARD ════ */}
          {page === "signup" && (
            <div
              className="bg-[#FFFAFA] rounded-2xl w-full"
              style={{
                padding: "clamp(8px, 1.8vh, 32px) clamp(20px, 6vw, 60px)",
                boxShadow: "0 0px 15px rgba(0,0,0,0.20)",
              }}
            >
              <div className="text-center" style={{ marginBottom: "clamp(4px, 1vh, 14px)", marginTop: "clamp(8px, 2vh, 24px)" }}>
                <p style={{ color: "#1a1a1a", fontSize: "clamp(16px, 3vh, 34px)" }}>
                  Welcome to{" "}
                  <span style={{ fontWeight: "bold", color: "#1C5332" }}>Truth</span>
                  <span style={{ fontWeight: "bold", color: "#F3B300" }}>Eye</span>
                  <span style={{ fontWeight: "bold", color: "#1C2933" }}>!</span>
                  {" "}Please log in or create a new account.
                </p>
                <h2 className="font-bold" style={{ color: "#1a1a1a", fontSize: "clamp(13px, 2.2vh, 20px)", marginTop: "clamp(2px, 0.4vh, 6px)" }}>
                  Start Your 14-Day Free Trial Today.
                </h2>
                <p style={{ color: "#888", fontSize: "clamp(9px, 1.1vh, 11px)", letterSpacing: "0.08em", marginTop: "1px" }}>NO CREDIT CARD REQUIRED!</p>
              </div>
              <div className="flex flex-col" style={{ gap: "clamp(4px, 0.9vh, 10px)" }}>
                {/* First Name */}
                <div>
                  <input
                    type="text" placeholder="Enter your first name" value={form.firstName}
                    onChange={e => updateField("firstName", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                    style={{ ...inputStyle, borderColor: signupSubmitted && form.firstName.trim() === "" ? "#e53e3e" : "#9E9E9E" }}
                    onFocus={e => (e.target.style.borderColor = signupSubmitted && form.firstName.trim() === "" ? "#e53e3e" : "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = signupSubmitted && form.firstName.trim() === "" ? "#e53e3e" : "#9E9E9E")}
                  />
                  {signupSubmitted && form.firstName.trim() === "" && (
                    <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px" }}>First name is required</p>
                  )}
                </div>
                {/* Last Name */}
                <div>
                  <input
                    type="text" placeholder="Enter your last name" value={form.lastName}
                    onChange={e => updateField("lastName", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                    style={{ ...inputStyle, borderColor: signupSubmitted && form.lastName.trim() === "" ? "#e53e3e" : "#9E9E9E" }}
                    onFocus={e => (e.target.style.borderColor = signupSubmitted && form.lastName.trim() === "" ? "#e53e3e" : "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = signupSubmitted && form.lastName.trim() === "" ? "#e53e3e" : "#9E9E9E")}
                  />
                  {signupSubmitted && form.lastName.trim() === "" && (
                    <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px" }}>Last name is required</p>
                  )}
                </div>
                {/* Phone */}
                <div>
                  <div
                    className="flex items-center rounded-lg border px-3 gap-2 transition-all"
                    style={{ borderColor: signupSubmitted && form.phone.trim() === "" ? "#e53e3e" : "#9E9E9E", backgroundColor: "#FFFAFA", height: "48px" }}
                  >
                    <select
                      value={selectedCountry.code}
                      onChange={e => setSelectedCountry(COUNTRY_CODES.find(c => c.code === e.target.value))}
                      className="outline-none bg-transparent text-sm"
                      style={{ cursor: "pointer", color: "#333", maxWidth: "90px" }}
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel" placeholder="Phone number" value={form.phone}
                      onChange={e => updateField("phone", e.target.value)}
                      className="flex-1 outline-none bg-transparent"
                      style={{ fontSize: "14px", color: "#333", border: "none", minWidth: 0 }}
                    />
                  </div>
                  {signupSubmitted && form.phone.trim() === "" && (
                    <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px" }}>Phone number is required</p>
                  )}
                </div>
                {/* Email */}
                <div>
                  <input
                    type="email" placeholder="Enter your university email" value={form.email}
                    onChange={e => updateField("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                    style={{ ...inputStyle, borderColor: signupSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "#e53e3e" : "#9E9E9E" }}
                    onFocus={e => (e.target.style.borderColor = signupSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "#e53e3e" : "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = signupSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "#e53e3e" : "#9E9E9E")}
                  />
                  {signupSubmitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                    <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: "4px" }}>
                      {form.email.trim() === "" ? "Email is required" : "Please enter a valid email address"}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} placeholder="Enter your password"
                    value={signupPassword}
                    onChange={e => {
                      setSignupPassword(e.target.value);
                      updateField("password", e.target.value);
                    }}
                    className="w-full px-4 py-3 rounded-lg border outline-none transition-all pr-12"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1C5332")}
                    onBlur={e => (e.target.style.borderColor = "#9E9E9E")}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600"
                    style={{ background: "none", border: "none", cursor: "pointer", color: showPassword ? "#1C5332" : "#bbb" }}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
                {/* Password strength checklist */}
                <div className="grid grid-cols-2 gap-x-4" style={{ rowGap: "clamp(1px, 0.4vh, 4px)", marginTop: "clamp(2px, 0.4vh, 6px)" }}>
                  {[
                    { key: "length",    label: "Use 8 or more characters" },
                    { key: "lowercase", label: "One lowercase character" },
                    { key: "special",   label: "One special character" },
                    { key: "number",    label: "One number" },
                    { key: "uppercase", label: "One Uppercase character" },
                  ].map(({ key, label }) => {
                    const passed = passwordChecks[key];
                    const showError = signupSubmitted && !passed;
                    const color = passed ? "#1C5332" : showError ? "#e53e3e" : "#999";
                    return (
                      <span
                        key={key}
                        className="flex items-center gap-1 transition-colors duration-200"
                        style={{ fontSize: "clamp(10px, 1.3vh, 12px)", color }}
                      >
                        {passed ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#1C5332" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : showError ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <line x1="2" y1="2" x2="10" y2="10" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="10" y1="2" x2="2" y2="10" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <span style={{ display: "inline-block", width: "12px", textAlign: "center" }}>•</span>
                        )}
                        {label}
                      </span>
                    );
                  })}
                </div>
                <label className="flex items-start gap-2 cursor-pointer select-none" style={{ fontSize: "clamp(11px, 1.3vh, 13px)", color: "#333", marginTop: "clamp(2px, 0.4vh, 6px)" }}>
                  <div
                    onClick={() => setReceiveEmails(!receiveEmails)}
                    className="flex items-center justify-center border-2 rounded transition-all mt-0.5 flex-shrink-0"
                    style={{
                      width: "18px", height: "18px", minWidth: "18px",
                      backgroundColor: receiveEmails ? "#1C5332" : "white",
                      borderColor: receiveEmails ? "#1C5332" : "#aaa",
                      cursor: "pointer",
                    }}
                  >
                    {receiveEmails && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  I want to receive emails about the product, feature updates, events, and marketing promotions.
                </label>
                <p className="text-xs" style={{ color: "#666" }}>
                  By Creating an Account, it means you agree to our{" "}
                  <span className="underline cursor-pointer" style={{ color: "#1C5332" }}>Privacy Policy</span>{" "}
                  and <span className="underline cursor-pointer" style={{ color: "#1C5332" }}>Terms of Service</span>
                </p>
                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => {
                      setSignupSubmitted(true);
                      if (signupValid) { setIdentityVerified(false); setShowIdentityModal(true); }
                    }}
                    className="py-3 rounded-xl font-bold text-[#FFFAFA] transition-all hover:opacity-90 hover:scale-[1.01]"
                    style={{
                      backgroundColor: "#1C5332",
                      fontSize: "15px",
                      cursor: "pointer",
                      border: "none",
                      width: "min(100%, 400px)",
                      height: "clamp(36px, 5.5vh, 48px)",
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ RIGHT SIDE PANEL — Desktop only ════ */}

          {/* Logo — login / forgot / verify / create_password */}
          {isDesktop && (page === "login" || page === "forgot" || page === "verify" || page === "create_password") && (
            <div
              className="fixed pointer-events-none z-10"
              style={{
                left: logoLeft,
                top: "50vh",
                transform: "translateY(-50%)",
                width: `${logoSize}px`,
                height: `${logoSize}px`,
                transition: "all 0.2s ease",
              }}
            >
              <img src={Logo1} alt="AI" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Steps — signup only, desktop */}
          {isDesktop && page === "signup" && (
            <div
              className="fixed z-10 flex flex-col justify-center"
              style={{
                left: stepsLeft,
                top: "50vh",
                transform: "translateY(-50%)",
                width: `${stepsWidth}px`,
                transition: "all 0.2s ease",
              }}
            >
              <div className="relative">
                <div
                  className="absolute"
                  style={{ left: "19px", top: "30px", bottom: "30px", width: "1.5px", backgroundColor: "rgba(255,255,255,0.3)" }}
                />
                <div className="flex flex-col" style={{ gap: "24px" }}>
                  {STEPS.map((step, i) => {
                    const done   = i < currentStep;
                    const active = i === currentStep;
                    return (
                      <div
                        key={step.label}
                        onClick={() => setCurrentStep(i)}
                        className="flex items-start gap-3 relative"
                        style={{ cursor: "pointer", zIndex: 1 }}
                      >
                        <div
                          className="flex-shrink-0 rounded-full flex items-center justify-center"
                          style={{
                            width: "38px", height: "38px",
                            backgroundColor: done ? "#F3B300" : "transparent",
                            border: done ? "none" : active ? "2px solid white" : "2px solid rgba(255,255,255,0.45)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {done && (
                            <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="#1C5332" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {active && (
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "white" }} />
                          )}
                        </div>
                        <div style={{ paddingTop: "4px" }}>
                          <p className="font-bold" style={{ color: "white", fontSize: "clamp(10px, 1vw, 13px)", letterSpacing: "0.06em" }}>
                            {step.label}
                          </p>
                          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(9px, 0.9vw, 11px)", lineHeight: "1.5", marginTop: "1px" }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════ IDENTITY VERIFICATION MODAL ════ */}
      {showIdentityModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="bg-white rounded-2xl flex flex-col items-center overflow-hidden w-full"
            style={{
              maxWidth: "480px",
              padding: "clamp(24px, 5vw, 36px) clamp(20px, 5vw, 32px) clamp(20px, 4vw, 32px)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* checkmark icon */}
            <div
              className="flex items-center justify-center rounded-full mb-4 flex-shrink-0"
              style={{ width: "64px", height: "64px", backgroundColor: identityVerified ? "#1C5332" : "#e0e0e0" }}
            >
              <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="font-bold mb-5" style={{ color: "#1a1a1a", fontSize: "clamp(15px, 4vw, 18px)", letterSpacing: "0.05em" }}>
              IDENTITY VERIFICATION
            </h2>

            {/* STATE 1: initial */}
            {!scanning && (
              <>
                <div
                  className="flex items-center justify-center mb-5 overflow-hidden flex-shrink-0"
                  style={{
                    width: "clamp(160px, 50vw, 220px)",
                    height: "clamp(160px, 50vw, 220px)",
                    borderRadius: "50%",
                    border: "2.5px solid #ccc",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <svg width="56" height="56" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="w-full rounded-full mb-2" style={{ height: "5px", backgroundColor: "#eee" }}>
                  <div className="rounded-full" style={{ width: "0%", height: "100%", backgroundColor: "#bbb" }} />
                </div>
                <p className="font-bold mb-4 mt-3" style={{ color: "#1a1a1a", fontSize: "16px" }}>Use Camera</p>
                <button
                  onClick={handleAllow}
                  className="rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#2563eb", border: "none", cursor: "pointer", width: "100%", height: "48px", fontSize: "16px" }}
                >
                  Allow
                </button>
              </>
            )}

            {/* STATE 2: scanning */}
            {scanning === true && (
              <>
                <div
                  className="relative mb-4 w-full overflow-hidden"
                  style={{ borderRadius: "12px", backgroundColor: "#111", aspectRatio: "4/3" }}
                >
                  <video ref={videoRef} autoPlay playsInline muted
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div style={{ width: "55%", paddingBottom: "55%", position: "relative" }}>
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: "3px solid #F3B300",
                        boxShadow: "0 0 12px rgba(243,179,0,0.5)",
                      }} />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg"
                    style={{ backgroundColor: "rgba(30,30,30,0.75)" }}>
                    <span style={{ color: "white", fontSize: "13px" }}>Scanning...</span>
                  </div>
                </div>
                <div className="w-full rounded-full mb-3" style={{ height: "5px", backgroundColor: "#eee" }}>
                  <div className="rounded-full" style={{
                    width: `${scanProgress}%`, height: "100%",
                    backgroundColor: "#F3B300", transition: "width 0.08s linear",
                  }} />
                </div>
                <p className="font-bold" style={{ color: "#1a1a1a", fontSize: "17px" }}>Scanning your face...</p>
              </>
            )}

            {/* STATE 3: done */}
            {scanning === "done" && (
              <>
                <div
                  className="relative mb-4 w-full overflow-hidden"
                  style={{ borderRadius: "12px", backgroundColor: "#111", aspectRatio: "4/3" }}
                >
                  <video ref={videoRef} autoPlay playsInline muted
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div style={{ width: "55%", paddingBottom: "55%", position: "relative" }}>
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: "3px solid #22c55e",
                        boxShadow: "0 0 16px rgba(34,197,94,0.5)",
                      }} />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span style={{ color: "white", fontSize: "14px" }}>Done ✓</span>
                  </div>
                </div>
                <div className="w-full rounded-full mb-3" style={{ height: "5px", backgroundColor: "#eee" }}>
                  <div className="rounded-full" style={{ width: "100%", height: "100%", backgroundColor: "#22c55e" }} />
                </div>
                <p className="font-bold mb-4" style={{ color: "#1a1a1a", fontSize: "17px" }}>Identity Verified Successfully!</p>
                <button
                  onClick={() => { setIdentityVerified(false); setScanning(false); setScanProgress(0); setShowIdentityModal(false); }}
                  className="rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#2563eb", border: "none", cursor: "pointer", width: "100%", height: "48px", fontSize: "16px" }}
                >
                  Continue →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════ MOBILE BOTTOM SHEET — only on mobile/tablet during signup ════ */}
      {page === "signup" && !isDesktop && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30"
          style={{
            transform: bottomSheetOpen ? "translateY(0)" : "translateY(calc(100% - 28px))",
            transition: "transform 0.3s ease",
            backgroundColor: "#FFFAFA",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {/* drag handle */}
          <div
            className="flex justify-center items-center cursor-pointer sticky top-0 bg-[#FFFAFA] z-10"
            style={{ height: "28px", paddingTop: "8px" }}
            onClick={() => setBottomSheetOpen(o => !o)}
          >
            <div style={{ width: "48px", height: "5px", borderRadius: "3px", backgroundColor: "#1a1a1a" }} />
          </div>

          <div style={{ padding: "16px 24px 40px" }}>
            <div className="relative">
              <div
                className="absolute"
                style={{ left: "19px", top: "28px", bottom: "28px", width: "1.5px", backgroundColor: "rgba(28,83,50,0.2)" }}
              />
              <div className="flex flex-col" style={{ gap: "20px" }}>
                {STEPS.map((step, i) => {
                  const done   = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step.label} className="flex items-start gap-3" style={{ position: "relative", zIndex: 1 }}>
                      <div
                        className="flex-shrink-0 rounded-full flex items-center justify-center"
                        style={{
                          width: "38px", height: "38px",
                          backgroundColor: done ? "#1C5332" : "transparent",
                          border: done ? "none" : active ? "2px solid #1C5332" : "2px solid rgba(28,83,50,0.35)",
                        }}
                      >
                        {done && (
                          <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {active && (
                          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#1C5332" }} />
                        )}
                      </div>
                      <div style={{ paddingTop: "6px" }}>
                        <p className="font-bold" style={{ color: "#1a1a1a", fontSize: "13px", letterSpacing: "0.05em" }}>{step.label}</p>
                        <p style={{ color: "#666", fontSize: "12px", lineHeight: "1.5", marginTop: "2px" }}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}