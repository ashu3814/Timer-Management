import React, { useState, useEffect } from "react";
import { Howl } from "howler";
import "./TimerList.css";

const sound = new Howl({
  src: ["https://www.soundjay.com/button/beep-07.mp3"],
});

function TimerList({ timers, onDeleteTimer, onEditTimer }) {
  const [runningTimers, setRunningTimers] = useState({});
  const [editingTimer, setEditingTimer] = useState(null);
  const [editedData, setEditedData] = useState({ name: "", duration: "", category: "", durationUnit: "seconds" });
  const [completedMessage, setCompletedMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setRunningTimers((prev) => {
        let updatedTimers = { ...prev };
        Object.keys(updatedTimers).forEach((id) => {
          if (updatedTimers[id]?.remainingTime > 0 && updatedTimers[id].isRunning) {
            updatedTimers[id].remainingTime -= 1;
          } else if (updatedTimers[id]?.remainingTime === 0) {
            setCompletedMessage(`${timers.find((t) => t.id === id)?.name} timer has completed!`);
            setTimeout(() => setCompletedMessage(""), 5000);
            sound.play();
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
  };

  const handleEditClick = (timer) => {
    setEditingTimer(timer.id);
    setEditedData({
      name: timer.name,
      duration: timer.duration,
      category: timer.category,
      durationUnit: "seconds",
    });
  };

  const handleEditChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = () => {
    const durationInSeconds =
      editedData.durationUnit === "minutes" ? editedData.duration * 60 : editedData.duration;
    onEditTimer({ id: editingTimer, ...editedData, duration: durationInSeconds });
    setEditingTimer(null);
  };

  return (
    <div className="timer-list">
      <h2>Timer List</h2>
      {completedMessage && (
        <div className="completion-message">
          <p>{completedMessage}</p>
        </div>
      )}
      <div className="timer-grid">
        {timers.map((timer) => {
          const remainingTime = runningTimers[timer.id]?.remainingTime ?? timer.duration;
          const progress = (remainingTime / timer.duration) * 100;

          return (
            <div key={timer.id} className="timer-card">
              <div className="timer-overlay">
                {editingTimer === timer.id ? (
                  <div className="edit-form">
                    <input name="name" value={editedData.name} onChange={handleEditChange} placeholder="Name" />
                    <input name="category" value={editedData.category} onChange={handleEditChange} placeholder="Category" />
                    <div className="edit-duration">
                      <input name="duration" type="number" min="1" value={editedData.duration} onChange={handleEditChange} placeholder="Duration" />
                      <select name="durationUnit" value={editedData.durationUnit} onChange={handleEditChange}>
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                      </select>
                    </div>
                    <button className="save-button" onClick={handleSaveEdit}>Save</button>
                  </div>
                ) : (
                  <>
                    <div className="timer-name">{timer.name}</div>
                    <div className="timer-category">{timer.category}</div>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#ddd" strokeWidth="10" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#0072ff"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (progress / 100) * 283}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20px" fill="white">
                        {remainingTime}s
                      </text>
                    </svg>
                    <div className="timer-controls">
                      <button className="start-button" onClick={() => startTimer(timer.id)}>Start</button>
                      <button className="pause-button" onClick={() => pauseTimer(timer.id)}>Pause</button>
                      <button className="reset-button" onClick={() => resetTimer(timer.id)}>Reset</button>
                      <button className="edit-button" onClick={() => handleEditClick(timer)}>Edit</button>
                      <button className="delete-button" onClick={() => onDeleteTimer(timer.id)}>Delete</button>
                    </div>
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
