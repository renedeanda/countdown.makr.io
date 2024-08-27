
'use client'

import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const Header = ({ toggleTheme, isDarkMode, onCelebrate }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-pink-500 dark:text-pink-400">Event Countdown</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={onCelebrate}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
        >
          Celebrate!
        </button>
        <button
          onClick={toggleTheme}
          className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition duration-300 ease-in-out"
        >
          {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
