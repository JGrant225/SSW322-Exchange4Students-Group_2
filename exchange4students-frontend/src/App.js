import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import { ItemPosting } from './Pages/ItemPosting'
import { LoginPage } from './Pages/LoginPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/itemPosting" element={<ItemPosting/>}/>
        <Route path="/LoginPage" element={<LoginPage/>}/>
      </Routes>
    </Router>
  ) 
}

export default App;
