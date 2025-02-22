import React from 'react';
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './Login';
import Dashboard from './Dashboard';

const App= () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard/>} />
     
      </Routes>
    </Router>
  );
};

if (document.getElementById("root")) {
    ReactDOM.render(<App />, document.getElementById("root"));
}