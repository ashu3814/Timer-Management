import React, { useState, useEffect } from "react";
import { Howl } from "howler";
import "./TimerList.css";

// Sound for timer completion
const sound = new Howl({
  src: ["https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"],
  volume: 0.7,
});

// Generate a gradient based on category
const getCategoryGradient = (category) => {
  if (!category) return "linear-gradient(45deg, #2193b0, #6dd5ed)";
  
  // Hash the category string to get a consistent color
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h1 = hash % 360;
  const h2 = (hash * 2) % 360;
  
  return `linear-gradient(45deg, hsl(${h1}, 70%, 60%), hsl(${h2}, 70%, 50%))`;
};

function TimerList({ timers, onDeleteTimer, onEditTimer, darkMode }) {
  const [runningTimers, setRunningTimers] = useState({});
  const [editingTimer, setEditingTimer] = useState(null);
  const [editedData, setEditedData] = useState({ 
    name: "", 
    duration: "", 
    category: "", 
    durationUnit: "seconds" 
  });
  const [completedTimers, setCompletedTimers] = useState({});

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editingTimer) {
        const activeTimerId = Object.keys(runningTimers).find(
          id => runningTimers[id]?.isRunning
        );
        
        if (activeTimerId) {
          if (e.key === " " || e.key === "p") {
            // Space or 'p' to pause active timer
            e.preventDefault();
            pauseTimer(activeTimerId);
          } else if (e.key === "r") {
            // 'r' to reset active timer
            e.preventDefault();
            resetTimer(activeTimerId);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [runningTimers, editingTimer]);

  // Timer tick effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRunningTimers((prev) => {
        let updatedTimers = { ...prev };
        let newCompletions = false;
        
        Object.keys(updatedTimers).forEach((id) => {
          if (updatedTimers[id]?.remainingTime > 0 && updatedTimers[id].isRunning) {
            updatedTimers[id].remainingTime -= 1;
            
            // Check if timer just completed
            if (updatedTimers[id].remainingTime === 0) {
              const timerName = timers.find((t) => t.id === parseInt(id))?.name || "Timer";
              sound.play();
              
              // Add to completed timers
              setCompletedTimers(prev => ({
                ...prev,
                [id]: {
                  name: timerName,
                  timestamp: new Date().toLocaleTimeString()
                }
              }));
              
              newCompletions = true;
            }
          }
        });
        
        return updatedTimers;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timers]);

  const startTimer = (id) => {
    setRunningTimers((prev) => ({
      ...prev,
      [id]: {
        remainingTime: prev[id]?.remainingTime ?? timers.find((t) => t.id === id).duration,
        isRunning: true,
      },
    }));
  };

  const pauseTimer = (id) => {
    setRunningTimers((prev) => ({
      ...prev,
      [id]: { ...prev[id], isRunning: false },
    }));
  };

  const resetTimer = (id) => {
    setRunningTimers((prev) => ({
      ...prev,
      [id]: {
        remainingTime: timers.find((t) => t.id === id).duration,
        isRunning: false,
      },
    }));
    
    // Remove from completed timers if it was there
    setCompletedTimers(prev => {
      const newCompletedTimers = { ...prev };
      delete newCompletedTimers[id];
      return newCompletedTimers;
    });
  };

  const dismissCompletionNotice = (id) => {
    setCompletedTimers(prev => {
      const newCompletedTimers = { ...prev };
      delete newCompletedTimers[id];
      return newCompletedTimers;
    });
  };

  const handleEditClick = (timer) => {
    let initialDuration = timer.duration;
    let durationUnit = "seconds";
    
    // Convert to minutes if duration is evenly divisible by 60 and >= 60
    if (timer.duration >= 60 && timer.duration % 60 === 0) {
      initialDuration = timer.duration / 60;
      durationUnit = "minutes";
    }
    
    setEditingTimer(timer.id);
    setEditedData({
      name: timer.name,
      duration: initialDuration,
      category: timer.category,
      durationUnit: durationUnit,
    });
  };

  const handleEditChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = () => {
    const durationInSeconds =
      editedData.durationUnit === "minutes" 
        ? Number(editedData.duration) * 60 
        : Number(editedData.duration);
        
    onEditTimer({ 
      id: editingTimer, 
      name: editedData.name,
      category: editedData.category,
      duration: durationInSeconds
    });
    
    // Update running timer if it exists
    if (runningTimers[editingTimer]) {
      setRunningTimers(prev => ({
        ...prev,
        [editingTimer]: {
          ...prev[editingTimer],
          remainingTime: durationInSeconds,
          isRunning: false
        }
      }));
    }
    
    setEditingTimer(null);
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate progress percentage safely
  const calculateProgress = (remainingTime, totalDuration) => {
    if (!totalDuration) return 0;
    return (remainingTime / totalDuration) * 100;
  };

  // Get color based on remaining time percentage
  const getProgressColor = (progress) => {
    if (progress > 66) return "#28a745"; // Green
    if (progress > 33) return "#ffc107"; // Yellow
    return "#dc3545"; // Red
  };

  return (
    <div className={`timer-list ${darkMode ? "dark" : ""}`}>
      <h2>Your Timers</h2>
      
      {/* Completed Timer Notifications */}
      {Object.keys(completedTimers).length > 0 && (
        <div className="completion-container">
          {Object.entries(completedTimers).map(([id, info]) => (
            <div className="completion-notification" key={id}>
              <div className="completion-content">
                <span className="completion-icon">✓</span>
                <p><strong>{info.name}</strong> completed at {info.timestamp}</p>
              </div>
              <button 
                className="dismiss-notice" 
                onClick={() => dismissCompletionNotice(id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* No timers message */}
      {timers.length === 0 && (
        <div className="no-timers">
          <p>No timers created yet. Add your first timer!</p>
        </div>
      )}
      
      {/* Timer Grid */}
      <div className="timer-grid">
        {timers.map((timer) => {
          const remainingTime = runningTimers[timer.id]?.remainingTime ?? timer.duration;
          const progress = calculateProgress(remainingTime, timer.duration);
          const isRunning = runningTimers[timer.id]?.isRunning || false;
          const progressColor = getProgressColor(progress);
          const categoryGradient = getCategoryGradient(timer.category);

          return (
            <div 
              key={timer.id} 
              className={`timer-card ${isRunning ? "running" : ""}`}
              style={{ background: categoryGradient }}
            >
              <div className="timer-overlay">
                {editingTimer === timer.id ? (
                  <div className="edit-form">
                    <input 
                      name="name" 
                      value={editedData.name} 
                      onChange={handleEditChange} 
                      placeholder="Timer Name"
                      aria-label="Timer Name" 
                    />
                    <input 
                      name="category" 
                      value={editedData.category} 
                      onChange={handleEditChange} 
                      placeholder="Category"
                      aria-label="Category" 
                    />
                    <div className="edit-duration">
                      <input 
                        name="duration" 
                        type="number" 
                        min="1" 
                        value={editedData.duration} 
                        onChange={handleEditChange} 
                        placeholder="Duration"
                        aria-label="Duration" 
                      />
                      <select 
                        name="durationUnit" 
                        value={editedData.durationUnit} 
                        onChange={handleEditChange}
                        aria-label="Duration Unit"
                      >
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                      </select>
                    </div>
                    <div className="edit-controls">
                      <button 
                        className="save-button" 
                        onClick={handleSaveEdit}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-button" 
                        onClick={() => setEditingTimer(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="timer-header">
                      <div className="timer-name">{timer.name}</div>
                      {timer.category && (
                        <div className="timer-category">{timer.category}</div>
                      )}
                    </div>
                    
                    <div className="timer-display">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          stroke={darkMode ? "#555" : "#ddd"} 
                          strokeWidth="10" 
                          fill="none" 
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke={progressColor}
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray="283"
                          strokeDashoffset={283 - (progress / 100) * 283}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                        <text 
                          x="50%" 
                          y="50%" 
                          textAnchor="middle" 
                          dy=".3em" 
                          fontSize="16px" 
                          fill={darkMode ? "white" : "black"}
                        >
                          {formatTime(remainingTime)}
                        </text>
                      </svg>
                      
                      {isRunning && (
                        <div className="pulse-indicator"></div>
                      )}
                    </div>
                    
                    <div className="timer-controls">
                      {!isRunning ? (
                        <button 
                          className="start-button" 
                          onClick={() => startTimer(timer.id)}
                          aria-label="Start timer"
                        >
                          Start
                        </button>
                      ) : (
                        <button 
                          className="pause-button" 
                          onClick={() => pauseTimer(timer.id)}
                          aria-label="Pause timer"
                        >
                          Pause
                        </button>
                      )}
                      
                      <button 
                        className="reset-button" 
                        onClick={() => resetTimer(timer.id)}
                        aria-label="Reset timer"
                      >
                        Reset
                      </button>
                      
                      <button 
                        className="edit-button" 
                        onClick={() => handleEditClick(timer)}
                        aria-label="Edit timer"
                      >
                        Edit
                      </button>
                      
                      <button 
                        className="delete-button" 
                        onClick={() => onDeleteTimer(timer.id)}
                        aria-label="Delete timer"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {isRunning && (
                      <div className="keyboard-hint">
                        Press Space/P to pause, R to reset
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimerList;