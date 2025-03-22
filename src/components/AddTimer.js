import React, { useState } from "react";
import "./AddTimer.css";

function AddTimer({ onAddTimer }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("seconds"); // Default unit
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !duration || duration <= 0) return; // Prevent negative or zero values

    // Convert minutes to seconds if necessary
    const durationInSeconds = durationUnit === "minutes" ? duration * 60 : duration;

    const newTimer = {
      id: Date.now(),
      name,
      duration: Number(durationInSeconds),
      category,
    };

    onAddTimer(newTimer);
    setName("");
    setDuration("");
    setCategory("");
    setDurationUnit("seconds"); // Reset unit to default
  };

  return (
    <div className="add-timer">
      <h2>Add Timer</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Timer Name" value={name} onChange={(e) => setName(e.target.value)} required />
        
        <div className="duration-input">
          <input type="number" placeholder="Duration" value={duration} onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 1) setDuration(value);
          }} required min="1" />
          
          {/* Dropdown for selecting Minutes or Seconds */}
          <select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value)}>
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>

        <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <button type="submit">Add Timer</button>
      </form>
    </div>
  );
}

export default AddTimer;
