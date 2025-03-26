import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import { ItemPosting } from './Pages/ItemPosting'
import { LoginPage } from './Pages/LoginPage'
import { Test } from './Pages/Test'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/ItemPosting" element={<ItemPosting/>}/>
        <Route path="/LoginPage" element={<LoginPage/>}/>
        <Route path="/Test" element={<Test/>}/>
      </Routes>
    </Router>
  ) 
}

export default App;
