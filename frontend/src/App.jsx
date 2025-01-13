import React from 'react';
import WebsiteGenerator from "./components/WebsiteGenerator";

function App() {
  console.log('App rendering');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <WebsiteGenerator />
    </div>
  );
}

export default App;
