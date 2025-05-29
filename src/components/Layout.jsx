import React from 'react';
    import { Link } from 'react-router-dom';
    import { ChefHat, UtensilsCrossed, Home, ListOrdered, UserCircle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const Header = () => (
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="py-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 shadow-lg sticky top-0 z-50"
      >
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link to="/" className="flex items-center space-x-3 text-white hover:opacity-90 transition-opacity">
            <UtensilsCrossed size={40} className="transform rotate-[-15deg]" />
            <h1 className="text-3xl font-bold tracking-tight">SwiftServe</h1>
          </Link>
          <nav className="space-x-6 flex items-center">
            <Link to="/" className="text-white hover:text-yellow-300 transition-colors text-lg font-medium flex items-center space-x-1">
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link to="/restaurants" className="text-white hover:text-yellow-300 transition-colors text-lg font-medium flex items-center space-x-1">
              <ListOrdered size={20} />
              <span>Restaurants</span>
            </Link>
            <Link to="/profile" className="text-white hover:text-yellow-300 transition-colors text-lg font-medium flex items-center space-x-1">
              <UserCircle size={20} />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </motion.header>
    );

    const Footer = () => (
      <footer className="py-8 bg-gray-800 text-gray-300 mt-auto">
        <div className="container mx-auto text-center px-4">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <ChefHat size={24} className="text-green-400" />
            <p className="text-lg font-semibold">SwiftServe</p>
          </div>
          <p className="text-sm">
            "Arrive Fresh, Eat Fresh - Your food will be ready just as you arrive!"
          </p>
          <p className="text-xs mt-2">
            © {new Date().getFullYear()} SwiftServe. All rights reserved.
          </p>
        </div>
      </footer>
    );

    const Layout = ({ children }) => {
      return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
      );
    };

    export default Layout;