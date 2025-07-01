import React, { useState, useEffect } from "react";
import { Github, Mail, ExternalLink, ArrowUp, Heart, Headphones } from "lucide-react";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footerElement = document.getElementById('animated-footer');
    if (footerElement) {
      observer.observe(footerElement);
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Decorative Wave */}
      <div className="relative">
        <svg
          className="w-full h-20 fill-current text-gray-100 dark:text-gray-900"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
          ></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
          ></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>

      <footer
        id="animated-footer"
        className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black text-gray-700 dark:text-gray-300 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#D2ECC1]/20 to-[#A8D8A0]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Floating Audio Icons */}
          <div className="absolute top-20 left-20 animate-bounce delay-300">
            <Headphones className="w-6 h-6 text-[#D2ECC1]/30" />
          </div>
          <div className="absolute top-40 right-32 animate-bounce delay-700">
            <Headphones className="w-4 h-4 text-[#A8D8A0]/40" />
          </div>
          <div className="absolute bottom-32 left-1/3 animate-bounce delay-1000">
            <Headphones className="w-5 h-5 text-[#D2ECC1]/25" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Main Content Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <a
                href="/"
                className="inline-block group"
              >
                <div className="relative">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-[#D2ECC1] group-hover:to-[#A8D8A0] transition-all duration-500">
                    BookRadio
                  </h2>
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#D2ECC1]/20 to-[#A8D8A0]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </div>
              </a>
              
              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  Free audiobooks sourced from LibriVox.
                </p>
                <p className="text-xl font-medium bg-gradient-to-r from-[#D2ECC1] to-[#A8D8A0] bg-clip-text text-transparent italic">
                  Listen. Learn. Enjoy.
                </p>
                
                {/* Stats */}
                <div className="flex gap-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#D2ECC1]">10K+</div>
                    <div className="text-xs text-gray-500">Books</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#A8D8A0]">50K+</div>
                    <div className="text-xs text-gray-500">Listeners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#D2ECC1]">100%</div>
                    <div className="text-xs text-gray-500">Free</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className={`space-y-6 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h3 className="text-lg font-bold text-[#D2ECC1] relative">
                Explore
                <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-[#D2ECC1] to-[#A8D8A0] rounded-full"></div>
              </h3>
              <nav className="space-y-3">
                {[
                  { to: "/", label: "Home" },
                  { to: "/#genres", label: "Genres" },
                  { to: "/#authors", label: "Authors" },
                  { to: "/#top", label: "Top Books" }
                ].map((link, index) => (
                  <a
                    key={link.to}
                    href={link.to}
                    className={`block group transition-all duration-300 hover:translate-x-2 delay-${index * 100}`}
                  >
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-[#D2ECC1] transition-colors duration-300">
                      {link.label}
                    </span>
                    <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-[#D2ECC1] to-[#A8D8A0] transition-all duration-300 mt-1">                    </div>
                  </a>
                ))}
              </nav>
            </div>

            {/* Connect Section */}
            <div className={`space-y-6 transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h3 className="text-lg font-bold text-[#D2ECC1] relative">
                Connect
                <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-[#D2ECC1] to-[#A8D8A0] rounded-full"></div>
              </h3>
              <div className="space-y-4">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group hover:translate-x-2 transition-all duration-300"
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-[#D2ECC1] group-hover:text-gray-800 transition-all duration-300">
                    <Github className="w-4 h-4" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-[#D2ECC1] transition-colors duration-300">
                    GitHub
                  </span>
                </a>
                
                <a
                  href="mailto:contact@bookradio.com"
                  className="flex items-center gap-3 group hover:translate-x-2 transition-all duration-300"
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-[#A8D8A0] group-hover:text-gray-800 transition-all duration-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-[#A8D8A0] transition-colors duration-300">
                    Contact Us
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className={`mt-16 p-8 bg-gradient-to-r from-[#D2ECC1]/10 to-[#A8D8A0]/10 rounded-2xl border border-[#D2ECC1]/20 backdrop-blur-sm transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Stay Updated
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get notified about new audiobooks and features
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D2ECC1] transition-all duration-300"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-[#D2ECC1] to-[#A8D8A0] text-gray-800 font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={`mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>© {new Date().getFullYear()}</span>
                <span className="font-medium bg-gradient-to-r from-[#D2ECC1] to-[#A8D8A0] bg-clip-text text-transparent">
                  BookRadio
                </span>
                <span>• All rights reserved</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                <span>for book lovers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;