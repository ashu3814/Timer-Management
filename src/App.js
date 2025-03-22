import React, { useState, useEffect } from "react";
import TimerList from "./components/TimerList";
import AddTimer from "./components/AddTimer";
import CategoryFilter from "./components/CategoryFilter";
import "./App.css";

function App() {
  const [timers, setTimers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [filteredCategory, setFilteredCategory] = useState("all");

  // Load timers and dark mode preference from localStorage on app start
  useEffect(() => {
    const storedTimers = JSON.parse(localStorage.getItem("timers")) || [];
    const storedDarkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
    setTimers(storedTimers);
    setDarkMode(storedDarkMode);
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timers", JSON.stringify(timers));
  }, [timers]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

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

  // Extract unique categories for filter
  const categories = ["all", ...new Set(timers.map((timer) => timer.category))].filter(Boolean);

  // Filter timers by category
  const filteredTimers = filteredCategory === "all" 
    ? timers 
    : timers.filter(timer => timer.category === filteredCategory);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="app-header">
        <h1>Timer Management App</h1>
        <button 
          className="theme-toggle" 
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
      
      <div className="app-main">
        <div className="app-sidebar">
          <AddTimer onAddTimer={addTimer} darkMode={darkMode} />
          <CategoryFilter 
            categories={categories} 
            activeCategory={filteredCategory} 
            onSelectCategory={setFilteredCategory}
            darkMode={darkMode}
          />
        </div>
        
        <TimerList 
          timers={filteredTimers} 
          onDeleteTimer={deleteTimer} 
          onEditTimer={editTimer} 
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

export default App;