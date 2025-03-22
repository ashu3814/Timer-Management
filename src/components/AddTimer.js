import React, { useState } from "react";
import "./AddTimer.css";

// Predefined categories
const predefinedCategories = [
  { id: "work", label: "💼 Work" },
  { id: "exercise", label: "🏋️ Exercise" },
  { id: "study", label: "📚 Study" },
  { id: "cooking", label: "🍳 Cooking" },
  { id: "meditation", label: "🧘 Meditation" },
  { id: "break", label: "☕ Break" }
];

function AddTimer({ onAddTimer, darkMode }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("seconds");
  const [category, setCategory] = useState("");
  const [showPredefined, setShowPredefined] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !duration || duration <= 0) return;

    const durationInSeconds = durationUnit === "minutes" ? duration * 60 : parseInt(duration);

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
    setDurationUnit("seconds");
  };

  const selectPredefinedCategory = (catId) => {
    // Get the display label without emoji
    const selectedCategory = predefinedCategories.find(c => c.id === catId);
    setCategory(selectedCategory.label);
    setShowPredefined(false);
  };

  return (
    <div className={`add-timer ${darkMode ? "dark" : ""}`}>
      <h2>Add Timer</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Timer Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        
        <div className="duration-input">
          <input 
            type="number" 
            placeholder="Duration" 
            value={duration} 
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) setDuration(value);
            }} 
            required 
            min="1" 
          />
          
          <select 
            value={durationUnit} 
            onChange={(e) => setDurationUnit(e.target.value)}
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>

        <div className="category-input">
          <input 
            type="text" 
            placeholder="Category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
          />
          <button 
            type="button" 
            className="category-toggle"
            onClick={() => setShowPredefined(!showPredefined)}
          >
            {showPredefined ? "▲" : "▼"}
          </button>
        </div>

        {showPredefined && (
          <div className="predefined-categories">
            {predefinedCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className="predefined-category"
                onClick={() => selectPredefinedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
        
        <button type="submit" className="add-button">Add Timer</button>
      </form>
    </div>
  );
}

export default AddTimer;