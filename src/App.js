import React from 'react';
import TranslationTool from './components/TranslationTool';
import './styles.css';

function App() {
  console.log('App is rendering');
  return (
    <div className="app-container">
      <h1>Research Translator</h1>
      <TranslationTool />
    </div>
  );
}

export default App;
