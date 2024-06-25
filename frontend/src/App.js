import React from 'react';
import { Board } from './components';


function App() {
  return (
    <div>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Board</h1>
        </div>
      </header>
      <main>
        <div className="max-w-fit mx-auto p-8">
          <Board/>
        </div>
      </main>
    </div>
  );
}

export default App;
