import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Landing } from './components/layout/Landing';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';

const App = () => (
  <Router>
    <>
      <Navbar />

      <Routes>
        <Route path='/' element={<Landing />} />
      </Routes>

      <section className='container'>
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </section>
    </>
  </Router>
);

export default App;
