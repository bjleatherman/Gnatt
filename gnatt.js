// Utility: Parse date string to Date object safely
function parseDate(dateStr) {
    // Make sure empty strings don't become Invalid Date
    if (!dateStr || dateStr.trim() === "") return null;
    const date = new Date(dateStr);
    // Check if the parsed date is valid
    return isNaN(date.getTime()) ? null : date;
  }

  // Utility: Get date range from data with cap
  function getDateRange(data) {
    const dateFields = [
      "expectedStart",
      "actualStart",
      "userOverwriteStart",
      "expectedEnd",
      "clientAgreedEnd",
      "userOverwriteEnd",
      "actualEnd"
    ];

    const dates = data.flatMap(row =>
      dateFields.map(field => parseDate(row[field])).filter(date => date !== null) // Ensure only valid dates are considered
    );

    if (dates.length === 0) return [];

    // Sort dates to reliably find min and max
    dates.sort((a, b) => a.getTime() - b.getTime());
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];


    const range = [];
    let limit = 365; // Cap to 365 days
    // Clone minDate to avoid modifying it
    let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

    // Ensure loop condition handles same-day maxDate correctly
    while (currentDate <= maxDate && limit > 0) {
      range.push(new Date(currentDate)); // Add a clone
      currentDate.setDate(currentDate.getDate() + 1);
      limit--;
    }

    return range;
  }

  // Format date as M/D
  function formatDateMD(dateString) {
    const date = parseDate(dateString); // Use safe parsing
    if (!date) return dateString; // Return original or placeholder if invalid/empty
    // Ensure '-' placeholders from renderStaticCells aren't formatted
    if (dateString === '-') return '-';
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  }

  // Main table component (split into two tables: left static, right scrollable)
  function ProjectTable({ data }) {
    // Memoize dateRange calculation
    const dateRange = React.useMemo(() => getDateRange(data), [data]);

    const staticHeaders = [
      "Expected Start",
      "Actual Start",
      "User Overwrite Start",
      "Expected End",
      "Client Agreed End",
      "User Overwrite End",
      "Actual End",
      "Analyst",
      "Phase"
    ];

     // Define keys for mapping data properties to cells cleanly
     const staticCellKeys = [
        "expectedStart", "actualStart", "userOverwriteStart",
        "expectedEnd", "clientAgreedEnd", "userOverwriteEnd",
        "actualEnd", "analyst", "phase"
    ];

    // Row height synchronization effect
    React.useEffect(() => {
      // Debounce or throttle this if performance becomes an issue on resize/data change
      const syncRowHeights = () => {
          // Add a small delay to allow DOM updates, especially after data changes
          setTimeout(() => {
              const leftRows = document.querySelectorAll('.left-table tbody tr');
              const rightRows = document.querySelectorAll('.right-table tbody tr');
              const minLength = Math.min(leftRows.length, rightRows.length);

              // Sync body row heights
              for (let i = 0; i < minLength; i++) {
                  const leftRow = leftRows[i];
                  const rightRow = rightRows[i];

                  // Reset heights before measuring to get natural height
                  leftRow.style.height = '';
                  rightRow.style.height = '';

                  // Get computed heights
                  const leftHeight = leftRow.getBoundingClientRect().height;
                  const rightHeight = rightRow.getBoundingClientRect().height;

                  // Apply the max height to both ONLY IF they differ significantly
                  // (prevents tiny fluctuations causing style changes)
                  const maxHeight = Math.max(leftHeight, rightHeight);
                  if (Math.abs(leftHeight - rightHeight) > 1) { // Tolerance of 1px
                      leftRow.style.height = `${maxHeight}px`;
                      rightRow.style.height = `${maxHeight}px`;
                  } else {
                      // If very close, just ensure they both have *some* explicit height set
                      // to avoid potential collapsing issues if one was exactly 0.
                       leftRow.style.height = `${maxHeight}px`;
                       rightRow.style.height = `${maxHeight}px`;
                  }
              }
          }, 50); // 50ms delay - adjust if needed
      };

      // Run initially and on data change
      syncRowHeights();

      // Optional: Add resize listener if needed
      // window.addEventListener('resize', syncRowHeights);
      // return () => window.removeEventListener('resize', syncRowHeights);

    }, [data, dateRange]); // Re-run when data or dateRange changes

    // --- COMPONENT RENDER ---
    return (
      <div> {/* Outer container for the component */}
        <h2 className="mb-4">Project Timeline Overview</h2>

        {/* Flex container for the two main panes */}
        <div style={{ display: "flex", width: "100%" }}>

          {/* LEFT TABLE CONTAINER: static columns, sticky */}
          <div className="left-table-container">
            <table className="table table-striped table-bordered left-table">
              <thead className="table-dark">
                <tr>
                  {staticHeaders.map((header, i) => (
                    <th key={`left-header-${i}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <tr key={`left-row-${rowIndex}`}>
                       {staticCellKeys.map((key, cellIndex) => {
                            // Determine if this key typically holds a date
                           const isDateField = key.toLowerCase().includes('start') || key.toLowerCase().includes('end');
                           let cellValue = row[key];
                           // Handle empty values specifically for overwrite fields
                           if ((key === 'userOverwriteStart' || key === 'userOverwriteEnd') && !cellValue) {
                               cellValue = '-';
                           } else if (!cellValue) {
                                cellValue = '-'; // Or handle other empty non-overwrite fields if needed
                           }

                           // Format if it's a date field and not the placeholder '-'
                           const displayValue = (isDateField && cellValue !== '-') ? formatDateMD(cellValue) : cellValue;

                           return (
                               <td key={`left-cell-${rowIndex}-${cellIndex}`}>
                                   {displayValue}
                               </td>
                           );
                       })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={staticHeaders.length}>No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* NEW: Outer wrapper for the right side to handle scrolling */}
          <div className="scrollable-right-pane">
              {/* RIGHT TABLE CONTAINER: Now just a simple container, NO overflow */}
              <div className="right-table-container">
                  <table className="table table-striped table-bordered right-table">
                      <thead className="table-dark">
                          <tr>
                              {dateRange.map((date, colIndex) => (
                                  <th key={`right-header-${colIndex}`}>
                                      {date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                  </th>
                              ))}
                          </tr>
                      </thead>
                      <tbody>
                          {data.length > 0 ? (
                              data.map((row, rowIndex) => (
                                  <tr key={`right-row-${rowIndex}`}>
                                      {dateRange.map((date, cellIndex) => {
                                          // Get the time at the START of the day for comparison
                                          const cellTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

                                          // Safely parse dates using the utility function and get time
                                          const expectedStart = parseDate(row.expectedStart)?.getTime();
                                          const expectedEnd = parseDate(row.expectedEnd)?.getTime();
                                          const actualStart = parseDate(row.actualStart)?.getTime();
                                          const actualEnd = parseDate(row.actualEnd)?.getTime();
                                          const overwriteStart = parseDate(row.userOverwriteStart)?.getTime();
                                          const overwriteEnd = parseDate(row.userOverwriteEnd)?.getTime();

                                          // Check ranges (inclusive)
                                          const isInExpectedRange = expectedStart != null && expectedEnd != null && cellTimestamp >= expectedStart && cellTimestamp <= expectedEnd;
                                          const isInActualRange = actualStart != null && actualEnd != null && cellTimestamp >= actualStart && cellTimestamp <= actualEnd;
                                          const isInOverwriteRange = overwriteStart != null && overwriteEnd != null && cellTimestamp >= overwriteStart && cellTimestamp <= overwriteEnd;

                                          let backgroundColor = '';
                                          let content = '';

                                          // Prioritize: Overwrite > Actual > Expected
                                          if (isInOverwriteRange) {
                                              backgroundColor = '#fde68a'; // Yellowish
                                              content = 'O';
                                          } else if (isInActualRange) {
                                              backgroundColor = '#fca5a5'; // Reddish
                                              content = 'A';
                                          } else if (isInExpectedRange) {
                                              backgroundColor = '#d1e7dd'; // Greenish
                                              content = 'E';
                                          }

                                          return (
                                              <td key={`right-cell-${rowIndex}-${cellIndex}`}>
                                                  {/* Render the colored div only if there's content */}
                                                  {content && (
                                                      <div style={{
                                                          width: '100%',
                                                          height: '50%', // Or adjust height as needed
                                                          margin: 'auto',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                          backgroundColor,
                                                          borderRadius: '2px',
                                                      }}>
                                                          {content}
                                                      </div>
                                                  )}
                                              </td>
                                          );
                                      })}
                                  </tr>
                              ))
                          ) : (
                              <tr>
                                  {/* Ensure this message spans correctly */}
                                  <td colSpan={dateRange.length || 1}>No timeline data available</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div> {/* End of right-table-container */}
          </div> {/* End of scrollable-right-pane */}

        </div> {/* End of main flex container */}
      </div> // End of outer component div
    );
  } // End of ProjectTable component

  // --- App Component ---
  function App() {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      fetch('./data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(json => {
            // Basic validation: ensure it's an array
            if (Array.isArray(json)) {
                 setData(json);
            } else {
                 console.error("Fetched data is not an array:", json);
                 throw new Error("Invalid data format received from server.");
            }
            setLoading(false);
        })
        .catch(error => {
            console.error('Error loading or processing data:', error);
            setError(error.message || "Failed to load data.");
            setLoading(false);
        });
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
        return <div className="container mt-3">Loading project data...</div>;
    }

    if (error) {
        return <div className="container mt-3 alert alert-danger">Error loading data: {error}</div>;
    }

    // ***** CORRECTED RETURN STATEMENT FOR APP *****
    // It should simply render the ProjectTable component and pass data to it.
    // The layout structure is handled *inside* ProjectTable.
    return (
      // Use container-fluid for full width responsiveness if desired
      <div className="container-fluid mt-3">
        {/* Render the ProjectTable component with the fetched data */}
        <ProjectTable data={data} />
      </div>
    );
    // ***** END OF CORRECTION *****
  } // End of App component

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
