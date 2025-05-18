
import React, { useState } from "react";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import { GlassContainer } from "@/components/ui/glass-container";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  // Login form state
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration form state
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const { login, register } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      await login(email, password);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    
    setPasswordsMatch(true);
    setIsRegistering(true);
    
    try {
      await register(registerEmail, registerPassword, firstName, lastName);
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 overflow-hidden">
      <StarfieldBackground />
      
      <div className="z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-synergy-cyan to-synergy-violet rounded-lg rotate-12"></div>
              <div className="h-12 w-12 bg-gradient-to-tr from-synergy-cyan/50 to-synergy-violet/50 rounded-lg -rotate-12 absolute top-0 left-0 animate-pulse-glow"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-wider mb-1">SynergySphere</h1>
          <p className="text-muted-foreground tracking-wide">Next-Generation Collaboration</p>
        </div>
        
        <GlassContainer variant="light" className="p-1 backdrop-blur-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 bg-synergy-navy/50 p-1">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-synergy-cyan/20 data-[state=active]:to-synergy-violet/20 data-[state=active]:text-white"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-synergy-cyan/20 data-[state=active]:to-synergy-violet/20 data-[state=active]:text-white"
              >
                Register
              </TabsTrigger>
            </TabsList>
            
            <div className="px-6 pb-8 pt-4">
              <TabsContent value="login" className="space-y-6 mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <FuturisticInput 
                    label="Email" 
                    placeholder="Enter your email" 
                    type="email" 
                    variant="cyan"
                    icon={<Mail className="h-4 w-4" />}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FuturisticInput 
                    label="Password" 
                    placeholder="Enter your password" 
                    type="password"
                    variant="cyan"
                    icon={<Lock className="h-4 w-4" />}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="remember" className="rounded border-white/20 bg-white/5" />
                      <label htmlFor="remember" className="text-muted-foreground">Remember me</label>
                    </div>
                    <Link to="/forgot-password" className="text-synergy-cyan hover:text-synergy-cyan/80 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                
                  <FuturisticButton 
                    variant="primary" 
                    glow="cyan"
                    ripple={true}
                    className="w-full"
                    iconRight={<LogIn className="h-4 w-4" />}
                    disabled={isLoggingIn}
                    type="submit"
                  >
                    {isLoggingIn ? "Authenticating..." : "Login"}
                  </FuturisticButton>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-synergy-navy/80 px-2 text-muted-foreground backdrop-blur-md">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 px-4 text-sm hover:bg-white/10 transition-colors">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.48 0-.238-.009-.87-.013-1.707-2.782.603-3.369-1.338-3.369-1.338-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.09-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.918.678 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.18.577.688.48C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
                    </svg>
                    <span>GitHub</span>
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 px-4 text-sm hover:bg-white/10 transition-colors">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"></path>
                    </svg>
                    <span>Google</span>
                  </button>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-6 mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FuturisticInput 
                      label="First Name" 
                      placeholder="John" 
                      variant="violet" 
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <FuturisticInput 
                      label="Last Name" 
                      placeholder="Doe" 
                      variant="violet" 
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <FuturisticInput 
                    label="Email" 
                    placeholder="john.doe@example.com" 
                    type="email" 
                    variant="violet"
                    icon={<Mail className="h-4 w-4" />}
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                  <FuturisticInput 
                    label="Password" 
                    placeholder="Create a secure password" 
                    type={showRegisterPassword ? "text" : "password"}
                    icon={
                      <span onClick={() => setShowRegisterPassword((v) => !v)} className="cursor-pointer">
                        {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    }
                    value={registerPassword}
                    onChange={(e) => {
                      setRegisterPassword(e.target.value);
                      setPasswordsMatch(e.target.value === confirmPassword);
                    }}
                    autoComplete="new-password"
                  />
                  <FuturisticInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? "text" : "password"}
                    icon={
                      <span onClick={() => setShowConfirmPassword((v) => !v)} className="cursor-pointer">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordsMatch(e.target.value === registerPassword);
                    }}
                    error={!passwordsMatch ? "Passwords do not match" : undefined}
                    autoComplete="new-password"
                  />
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="rounded border-white/20 bg-white/5" 
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground">
                      I agree to the <Link to="/terms" className="text-synergy-violet hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-synergy-violet hover:underline">Privacy Policy</Link>
                    </label>
                  </div>
                  
                  <FuturisticButton 
                    variant="secondary" 
                    glow="violet"
                    ripple={true}
                    className="w-full"
                    iconRight={<UserPlus className="h-4 w-4" />}
                    type="submit"
                    disabled={isRegistering || !passwordsMatch}
                  >
                    {isRegistering ? "Creating Account..." : "Create Account"}
                  </FuturisticButton>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </GlassContainer>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/4 -right-16 w-32 h-32 bg-synergy-cyan/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-16 w-32 h-32 bg-synergy-violet/20 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
}
