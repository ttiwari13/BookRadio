import React from "react";

const DropdownSidebar = ({ darkMode }) => {
  return (
    <div
  className={`absolute right-4 mt-2 w-full sm:w-72 px-6 py-6 z-50 
    ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"} 
    transition-all rounded-xl shadow-2xl ml-4`}
    >

      <h2 className="text-lg font-semibold mb-4">🎯 Filters</h2>

      {/* Language Dropdown */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Language</label>
        <select className="w-full p-2 rounded bg-white text-black">
          <option>English</option>
          <option>Hindi</option>
          <option>Spanish</option>
        </select>
      </div>

      {/* Genre Dropdown */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Genre</label>
        <select className="w-full p-2 rounded bg-white text-black">
          <option>Fiction</option>
          <option>Non-fiction</option>
          <option>Romance</option>
          <option>Thriller</option>
        </select>
      </div>

      {/* Author Dropdown */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Author</label>
        <select className="w-full p-2 rounded bg-white text-black">
          <option>J.K. Rowling</option>
          <option>Premchand</option>
          <option>Dan Brown</option>
        </select>
      </div>

      {/* Duration Dropdown */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Duration</label>
        <select className="w-full p-2 rounded bg-white text-black">
          <option>&lt; 30 mins</option>
          <option>30-60 mins</option>
          <option>1-2 hours</option>
        </select>
      </div>
    </div>
  );
};

export default DropdownSidebar;
