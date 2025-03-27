import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import { LoginPage } from './Pages/LoginPage';
import BrowseItems from './Pages/BrowseItems';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/BrowseItems" element={<BrowseItems />} />
      </Routes>
    </Router>
  );
}

export default App;
