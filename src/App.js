import React, { useState, useEffect } from "react";
import TimerList from "./components/TimerList";
import AddTimer from "./components/AddTimer";
import "./App.css";

function App() {
  const [timers, setTimers] = useState([]);

  // Load timers from localStorage on app start
  useEffect(() => {
    const storedTimers = JSON.parse(localStorage.getItem("timers")) || [];
    setTimers(storedTimers);
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timers", JSON.stringify(timers));
  }, [timers]);

  const addTimer = (timer) => {
    setTimers([...timers, timer]);
  };

  const deleteTimer = (id) => {
    setTimers(timers.filter((timer) => timer.id !== id));
  };

  const editTimer = (updatedTimer) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => (timer.id === updatedTimer.id ? updatedTimer : timer))
    );
  };

  return (
    <div className="app-container">
      <h1>Timer Management App</h1>
      <AddTimer onAddTimer={addTimer} />
      <TimerList timers={timers} onDeleteTimer={deleteTimer} onEditTimer={editTimer} />
    </div>
  );
}

export default App;
