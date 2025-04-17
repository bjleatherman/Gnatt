import React, { useState, useEffect, useRef, useId } from 'react';
import analystData from './data/analysts'
import './Combobox.css';

const allAnalysts = analystData[0]?.analysts || [];

// Accept props, specifically initialValue. Provide a default.
function Combobox({ initialValue = '' }) {
  // Initialize the inputValue state with the provided initialValue prop
  const [inputValue, setInputValue] = useState(initialValue);
  const [filteredAnalysts, setFilteredAnalysts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const comboboxRef = useRef(null);
  const inputRef = useRef(null);
  const listboxRef = useRef(null);

  const inputId = useId();
  const listboxId = useId();

  // Effect to filter analysts when input value changes OR when dropdown opens
  useEffect(() => {
    // No need to filter if closed *unless* we want to pre-filter on initial load
    // if (!isOpen) return; // We might remove this temporarily for initial check

    let currentAnalystsToShow = [];
    if (inputValue === '') {
      // If dropdown is open and input is empty, show all
      // If closed, maybe don't show any until focus/typing
      currentAnalystsToShow = isOpen ? allAnalysts : [];
    } else {
      currentAnalystsToShow = allAnalysts.filter(analyst =>
        analyst.toLowerCase().includes(inputValue.toLowerCase())
      );
    }
    setFilteredAnalysts(currentAnalystsToShow);
    setActiveIndex(-1); // Reset keyboard selection

     // **Important**: If an initialValue is set, but the dropdown isn't open,
     // filteredAnalysts will be empty initially based on the logic above.
     // This is usually fine, as they'll appear on focus/typing.
     // If you *always* wanted the list filtered even when closed based on initialValue,
     // you'd adjust the logic here, but that's less common for a combobox.

  }, [inputValue, isOpen]); // Rerun when inputValue or isOpen changes


  // Effect to handle clicks outside the combobox to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [comboboxRef]);

  // --- Event Handlers ---

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Show filtered list based on current input, or all if input is empty
    if (inputValue === '') {
       setFilteredAnalysts(allAnalysts);
    } else {
         setFilteredAnalysts(
            allAnalysts.filter(analyst =>
              analyst.toLowerCase().includes(inputValue.toLowerCase())
            )
         );
    }
  };

  const handleOptionMouseDown = (analyst) => {
    setInputValue(analyst);
    setFilteredAnalysts([]); // Clear suggestions
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!isOpen || filteredAnalysts.length === 0) {
       // Allow Escape even if list is empty/closed
       if (event.key === 'Escape') {
           setIsOpen(false);
           setActiveIndex(-1);
       }
       // Allow Tab to work normally
       if (event.key === 'Tab') {
           setIsOpen(false); // Close dropdown on tab out
           setActiveIndex(-1);
       }
       // If list not open or empty, don't handle arrow keys etc.
       if (!(event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter')) {
            return;
       }
    }


    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((prevIndex) =>
          prevIndex < filteredAnalysts.length - 1 ? prevIndex + 1 : 0
        );
        scrollOptionIntoView(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredAnalysts.length - 1
        );
        scrollOptionIntoView(activeIndex - 1);
        break;
      case 'Enter':
         event.preventDefault();
         if (activeIndex >= 0 && activeIndex < filteredAnalysts.length) {
           handleOptionMouseDown(filteredAnalysts[activeIndex]);
         } else {
            setIsOpen(false); // Close dropdown if Enter pressed with no selection
            setActiveIndex(-1);
         }
         break;
      case 'Escape':
        event.preventDefault(); // Prevent potential form cancel/etc.
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false); // Close dropdown on tab out
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  const scrollOptionIntoView = (index) => {
    if (listboxRef.current && listboxRef.current.children[index]) {
      listboxRef.current.children[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  return (
    <div className="combobox-container" ref={comboboxRef}>
      {/* Label is optional, manage outside if needed */}
      {/* <label htmlFor={inputId} className="combobox-label">Select Analyst:</label> */}
      <div className="combobox-wrapper">
        <input
          type="text"
          id={inputId}
          ref={inputRef}
          className="combobox-input"
          value={inputValue} // Value is controlled by state
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && filteredAnalysts.length > 0}
          aria-controls={isOpen ? listboxId : undefined} // Only point to listbox when open
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          placeholder="Type to search..."
        />
      </div>

      {isOpen && filteredAnalysts.length > 0 && (
        <ul
          id={listboxId}
          ref={listboxRef}
          className="combobox-listbox"
          role="listbox"
        >
          {filteredAnalysts.map((analyst, index) => (
            <li
              key={analyst}
              id={`${listboxId}-option-${index}`}
              className={`combobox-option ${index === activeIndex ? 'active' : ''}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={() => handleOptionMouseDown(analyst)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {analyst}
            </li>
          ))}
        </ul>
      )}
       {isOpen && inputValue && filteredAnalysts.length === 0 && (
         <div className="combobox-no-results">No analysts found.</div>
       )}
    </div>
  );
}

// Optional: Add prop types for better maintainability
// If you have PropTypes installed:
/*
import PropTypes from 'prop-types';
Combobox.propTypes = {
  initialValue: PropTypes.string,
};
*/

export default Combobox;