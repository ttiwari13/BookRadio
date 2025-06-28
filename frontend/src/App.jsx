import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './components/Home'
import BookDetail from './components/BookDetail';
function App() {
  return (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/books/:id" element={<BookDetail />} /> {/* ✅ */}
  </Routes>

  )
}

export default App;
