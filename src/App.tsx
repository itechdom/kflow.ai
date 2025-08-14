import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import HomePage from './components/HomePage';
import NotePage from './components/NotePage';
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
