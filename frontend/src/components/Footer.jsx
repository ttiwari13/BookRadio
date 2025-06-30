import React from "react";
import { Link } from "react-router-dom";
import { Github, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-gray-950 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 mt-20 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand Info */}
        <div>
          <Link
            to="/"
            className="text-3xl font-bold text-black dark:text-white hover:text-[#D2ECC1] dark:hover:text-[#D2ECC1] transition-colors"
          >
            BookRadio
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Free audiobooks sourced from LibriVox.<br />
            <span className="italic">Listen. Learn. Enjoy.</span>
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-[#D2ECC1]">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#D2ECC1] transition">Home</Link></li>
            <li><Link to="/#genres" className="hover:text-[#D2ECC1] transition">Genres</Link></li>
            <li><Link to="/#authors" className="hover:text-[#D2ECC1] transition">Authors</Link></li>
            <li><Link to="/#top" className="hover:text-[#D2ECC1] transition">Top Books</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-[#D2ECC1]">Account</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-[#D2ECC1] transition">Profile</Link></li>
            <li><button onClick={() => window.scrollTo(0, 0)} className="hover:text-[#D2ECC1] transition">Login</button></li>
            <li><button onClick={() => window.scrollTo(0, 0)} className="hover:text-[#D2ECC1] transition">Signup</button></li>
          </ul>
        </div>

        {/* Social & Contact */}
        <div>
          <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-[#D2ECC1]">About</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <a href="https://librivox.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D2ECC1] transition">
                LibriVox Source
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D2ECC1] transition">
                GitHub
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:contact@bookradio.com" className="hover:text-[#D2ECC1] transition">
                contact@bookradio.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 py-5">
        © {new Date().getFullYear()} <span className="font-medium text-[#D2ECC1]">BookRadio</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
