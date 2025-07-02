import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './components/Home';
import Landing from './components/Landing';
import BookDetail from './components/BookDetail'; // You'll need to create this component

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Home />} />
            <Route path="/books/:id" element={<BookDetail />} />
         
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
       
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;