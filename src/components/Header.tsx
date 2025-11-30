import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll("#features, #how-it-works");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        // Even if there's an error, clear local state and redirect
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
    // Always clear session and navigate regardless of error
    setSession(null);
    toast.success("Logged out", {
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-[999] pt-3 sm:pt-4 pb-2 sm:pb-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 backdrop-blur-md border border-white/10 rounded-full px-4 sm:px-6 shadow-lg bg-gradient-to-br from-background via-accent/20 to-background">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl sm:text-3xl font-bold text-foreground drop-shadow-lg">ema.</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <a 
              href="/#features" 
              className={`text-sm font-medium rounded-full px-4 py-2 transition-all ${
                activeSection === "features" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted/60"
              }`}
            >
              Features
            </a>
            <a 
              href="/#how-it-works" 
              className={`text-sm font-medium rounded-full px-4 py-2 transition-all ${
                activeSection === "how-it-works" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted/60"
              }`}
            >
              How It Works
            </a>
            <Link to="/articles" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
              Evidence
            </Link>
            {session && (
              <>
                <Link to="/dashboard" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
                  Dashboard
                </Link>
                <Link to="/subscription" className="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">
                  Subscription
                </Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full hover:bg-muted/60 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            
            {session ? (
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="lg" 
                className="hidden md:flex gap-2 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="lg" className="hidden md:flex gap-2 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1.5 sm:p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 py-4 bg-card/95 backdrop-blur-lg border border-border rounded-2xl px-4 shadow-xl animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a 
                href="/#features" 
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                  activeSection === "features" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:text-accent"
                }`}
              >
                Features
              </a>
              <a 
                href="/#how-it-works" 
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                  activeSection === "how-it-works" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:text-accent"
                }`}
              >
                How It Works
              </a>
              <Link to="/articles" className="text-sm font-medium hover:text-accent transition-colors px-3 py-2 rounded-lg">
                Evidence
              </Link>
              {session && (
                <>
                  <Link to="/dashboard" className="text-sm font-medium hover:text-accent transition-colors px-3 py-2 rounded-lg">
                    Dashboard
                  </Link>
                  <Link to="/subscription" className="text-sm font-medium hover:text-accent transition-colors px-3 py-2 rounded-lg">
                    Subscription
                  </Link>
                </>
              )}
              {session ? (
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="w-full rounded-full gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="w-full rounded-full">
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
