import React from "react";
import "./CategoryFilter.css";

// Predefined categories with emoji icons
const predefinedCategories = [
  { id: "work", label: "💼 Work" },
  { id: "exercise", label: "🏋️ Exercise" },
  { id: "study", label: "📚 Study" },
  { id: "cooking", label: "🍳 Cooking" },
  { id: "meditation", label: "🧘 Meditation" },
  { id: "break", label: "☕ Break" }
];

function CategoryFilter({ categories, activeCategory, onSelectCategory, darkMode }) {
  // Combine predefined and user-created categories
  const allCategories = [
    { id: "all", label: "All Timers" },
    ...predefinedCategories.filter(pc => 
      categories.some(c => c.toLowerCase() === pc.id)
    ),
    ...categories
      .filter(c => c && c !== "all" && !predefinedCategories.some(pc => pc.id === c.toLowerCase()))
      .map(c => ({ id: c, label: c }))
  ];

  return (
    <div className={`category-filter ${darkMode ? "dark" : ""}`}>
      <h2>Filter by Category</h2>
      
      <div className="category-list">
        {allCategories.length <= 1 ? (
          <p className="no-categories">No categories yet. Add timers with categories to see them here.</p>
        ) : (
          allCategories.map(category => (
            <button
              key={category.id}
              className={`category-button ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryFilter;