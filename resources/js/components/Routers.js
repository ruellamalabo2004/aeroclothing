import React from 'react';
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import AdminDashboard from './AdminDashboard';


const App= () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

if (document.getElementById("root")) {
    ReactDOM.render(<App />, document.getElementById("root"));
}