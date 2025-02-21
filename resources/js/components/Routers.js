import React from 'react';
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';

const App= () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

if (document.getElementById("root")) {
    ReactDOM.render(<App />, document.getElementById("root"));
}