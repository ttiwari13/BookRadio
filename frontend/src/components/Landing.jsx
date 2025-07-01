import { Link } from "react-router-dom";
import { Headphones, Search, Star, ArrowRight, Play, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
};

const float = {
  y: [-10, 10, -10],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const Landing = () => {
  const { darkMode } = useTheme();

  const bg = darkMode
    ? "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]"
    : "bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50";

  const textColor = darkMode ? "text-white" : "text-gray-900";

  return (
    <Layout>
      <div className={`min-h-screen ${bg} ${textColor} overflow-hidden relative`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-purple-400/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"
          />
        </div>

        {/* Hero Section */}
        <section className="flex flex-row items-center justify-between px-6 md:px-20 py-20 gap-4 sm:gap-10 relative z-10">
          {/* TEXT LEFT */}
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.2 }}
            variants={slideInLeft}
            className="w-1/2"
          >
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 ${
                darkMode 
                  ? "bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-400/30 text-teal-300" 
                  : "bg-gradient-to-r from-teal-100 to-purple-100 border border-teal-300 text-teal-700"
              }`}
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>10,000+ Books Available</span>
            </motion.div>

            <motion.h1 
              variants={fadeUp}
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 sm:mb-6 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
            >
              Discover & Listen <br />
              to <span className="relative">
                Free Audiobooks
                <motion.div
                  animate={{ scaleX: [0, 1, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-purple-600 origin-left"
                />
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              transition={{ delay: 0.3 }}
              className={`text-sm sm:text-lg mb-4 sm:mb-8 max-w-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Stream thousands of audiobooks across genres, languages, and authors 
            </motion.p>

            <motion.div 
              variants={fadeUp}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/explore"
                className="group bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 text-white font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <Headphones size={18} className="relative z-10" /> 
                <span className="relative z-10">Start Listening</span>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex items-center gap-6 mt-6 sm:mt-8"
            >
              {[
                { number: "10K+", label: "Books" },
                { number: "50+", label: "Languages" },
                { number: "Free", label: "Forever" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <motion.div
                    animate={pulse}
                    transition={{ delay: i * 0.2 }}
                    className="text-lg sm:text-2xl font-bold text-teal-400"
                  >
                    {stat.number}
                  </motion.div>
                  <div className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* IMAGE RIGHT */}
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.6 }}
            variants={slideInRight}
            className="w-1/2 flex justify-center relative"
          >
            {/* Floating Elements around image */}
            <motion.div
              animate={float}
              className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-sm opacity-60"
            />
            <motion.div
              animate={float}
              transition={{ delay: 1 }}
              className="absolute -bottom-6 -right-6 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm opacity-60"
            />
            <motion.div
              animate={float}
              transition={{ delay: 0.5 }}
              className="absolute top-10 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-sm opacity-60"
            />

            {/* Main Image */}
            <motion.div
              animate={float}
              className="relative"
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 20px 50px rgba(0,0,0,0.3)",
                    "0 30px 60px rgba(20,184,166,0.4)",
                    "0 20px 50px rgba(0,0,0,0.3)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="rounded-3xl overflow-hidden"
              >
                <img
                  src="/hero-books.png"
                  alt="Books and Audio"
                  className="w-full max-w-[200px] sm:max-w-[280px] md:max-w-[350px] lg:max-w-[450px] xl:max-w-[520px] rounded-3xl"
                />
              </motion.div>

              {/* Glowing border effect */}
              <motion.div
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-teal-400/20 via-purple-400/20 to-cyan-400/20 blur-xl -z-10"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className={`py-20 px-6 md:px-20 relative ${darkMode ? "bg-[#0f172a]/50" : "bg-white/50"} backdrop-blur-sm`}>
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">
                Why BookRadio?
              </h2>
              <p className={`text-lg max-w-xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Built for listeners. Open access to a vast collection of free audiobooks.
              </p>
            </motion.div>
          </div>

          <div className="grid gap-10 md:grid-cols-3 text-center">
            {[
              { Icon: Search, title: "Smart Search", text: "Find books by title, author, or duration.", color: "from-blue-400 to-cyan-400" },
              { Icon: Headphones, title: "Pure Audio", text: "Minimal UI, immersive experience.", color: "from-teal-400 to-emerald-400" },
              { Icon: Star, title: "Customizable", text: "Login, theme toggle, save favorites.", color: "from-purple-400 to-pink-400" },
            ].map(({ Icon, title, text, color }, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 10,
                  transition: { type: "spring", stiffness: 200 }
                }}
                className={`group p-8 rounded-2xl shadow-lg backdrop-blur-md border transition-all duration-300 ${
                  darkMode 
                    ? "bg-white/5 border-white/10 hover:border-white/20" 
                    : "bg-white/80 border-gray-200 hover:border-gray-300"
                } hover:shadow-2xl`}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg`}
                >
                  <Icon size={30} className="text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-400 transition-colors">
                  {title}
                </h3>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6 md:px-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              What Our Listeners Say
            </h2>
            <p className={`text-lg max-w-xl mx-auto mb-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Trusted by 10,000+ audiobook lovers globally. Here's what a few of them have to say.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ananya", review: "Best free audiobook app I've ever used. Smooth UI, great selection!", avatar: "👩🏻‍💼" },
              { name: "Kabir", review: "Simple, elegant, and packed with value. I love the dark mode!", avatar: "👨🏻‍💻" },
              { name: "Riya", review: "Finally something that lets me relax while reading classic literature.", avatar: "👩🏻‍🎓" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ 
                  y: -10,
                  rotateX: 5,
                  transition: { type: "spring", stiffness: 200 }
                }}
                className={`relative rounded-xl p-6 shadow-xl border transition-all duration-300 ${
                  darkMode 
                    ? "bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:border-white/20" 
                    : "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300"
                } hover:shadow-2xl group`}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                  className="text-4xl mb-4"
                >
                  {item.avatar}
                </motion.div>
                <p className="italic mb-4 group-hover:text-teal-400 transition-colors">
                  "{item.review}"
                </p>
                <p className="font-bold text-teal-500">— {item.name}</p>
                
                {/* Decorative elements */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-60"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-20 px-6 relative overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-teal-600 via-purple-600 to-cyan-600 opacity-90"
          />
          <div className="relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.h2
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-2xl sm:text-3xl font-semibold mb-6"
              >
                Start your audio journey today
              </motion.h2>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/explore"
                  className="group bg-white hover:bg-gray-100 text-teal-600 font-bold px-8 py-4 rounded-full inline-flex items-center gap-2 text-lg shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  <motion.div
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                  <span className="relative z-10">Browse Library</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={20} className="relative z-10" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Landing;