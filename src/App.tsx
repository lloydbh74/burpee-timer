import { useState } from 'react';
import { ConfigurationForm } from './components/ConfigurationForm';
import { WorkoutSession } from './components/WorkoutSession';
import type { SessionParams } from './utils/calculator';
import './App.css';

function App() {
  const [params, setParams] = useState<SessionParams | null>(null);

  const handleStart = (newParams: SessionParams) => {
    setParams(newParams);
  };

  const handleExit = () => {
    setParams(null);
  };

  return (
    <div className="app-container">
      {!params ? (
        <ConfigurationForm onStart={handleStart} />
      ) : (
        <WorkoutSession params={params} onExit={handleExit} />
      )}
    </div>
  );
}

export default App;
