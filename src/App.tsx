import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './store/store';
import HomePage from './pages/HomePage';
import NotePage from './pages/NotePage';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={<HomePage />} 
            />
            <Route 
              path="/note/:noteId" 
              element={<NotePage />} 
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
