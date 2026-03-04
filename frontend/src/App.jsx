import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Landing from './components/Landing';
import BookDetail from './components/BookDetail';
import Favorites from './components/Favorites';
import HistoryPage from './components/HistoryPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<Home />} />
      <Route path="/books/:id" element={<BookDetail />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}

export default App;