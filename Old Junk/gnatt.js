// gnatt.js - COMBINED FILE for Babel Standalone

// --- Utility Functions (Original Logic) ---

function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === "" || dateStr.trim() === '-') {
        return null;
    }
    const date = new Date(dateStr);
    // Check if the date is valid
    return isNaN(date.getTime()) ? null : date;
}

function formatDateMD(date) { // Expects Date object or null
    if (!date || isNaN(date.getTime())) return '-';
    // Using toLocaleDateString which is widely supported
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}


function getDateRange(data, dateFields) {
     if (!data || data.length === 0) return [];

    const dates = data.flatMap(row =>
        dateFields
            .map(field => parseDate(row[field])) // Use original parseDate
            .filter(date => date !== null)
    );

    if (dates.length === 0) return [];

    dates.sort((a, b) => a.getTime() - b.getTime());

    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const range = [];
    // Use start of day for consistency in range generation
    let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const finalDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());

    // Loop includes the finalDate
    while (currentDate <= finalDate) {
        range.push(new Date(currentDate)); // Push a copy
        currentDate.setDate(currentDate.getDate() + 1);
        // Safety break - remove if confident range won't be excessively large
        if (range.length > 1000) {
             console.warn("Date range exceeded 1000 days, stopping.");
             break;
        }
    }
    return range;
}


// --- Configuration ---

const STATIC_COLUMN_CONFIG = [
    { header: "Expected Start", key: "expectedStart", isDate: true },
    { header: "Actual Start", key: "actualStart", isDate: true },
    { header: "User Overwrite Start", key: "userOverwriteStart", isDate: true },
    { header: "Expected End", key: "expectedEnd", isDate: true },
    { header: "Client Agreed End", key: "clientAgreedEnd", isDate: true },
    { header: "User Overwrite End", key: "userOverwriteEnd", isDate: true },
    { header: "Actual End", key: "actualEnd", isDate: true },
    { header: "Analyst", key: "analyst", isDate: false },
    { header: "Phase", key: "phase", isDate: false }
];

const DATE_RANGE_FIELDS = [
    "expectedStart", "actualStart", "userOverwriteStart",
    "expectedEnd", "clientAgreedEnd", "userOverwriteEnd", "actualEnd"
];

const TIMELINE_COLORS = {
    OVERWRITE: '#fde68a',
    ACTUAL: '#fca5a5',
    EXPECTED: '#d1e7dd',
};

const TIMELINE_MARKERS = {
    OVERWRITE: 'O',
    ACTUAL: 'A',
    EXPECTED: 'E',
};


// --- React Components (Define in order of dependency: Cell -> Tables -> View -> App) ---

// --- TimelineCell Component ---
// --- TimelineCell Component ---
const TimelineCell = React.memo(({ date, rowData }) => {
    // --- Date parsing and range checking logic remains exactly the same ---
    const cellTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const expectedStart = parseDate(rowData.expectedStart)?.getTime();
    const expectedEnd = parseDate(rowData.expectedEnd)?.getTime();
    const actualStart = parseDate(rowData.actualStart)?.getTime();
    const actualEnd = parseDate(rowData.actualEnd)?.getTime();
    const overwriteStart = parseDate(rowData.userOverwriteStart)?.getTime();
    const overwriteEnd = parseDate(rowData.userOverwriteEnd)?.getTime();

    const isInOverwriteRange = overwriteStart != null && overwriteEnd != null && cellTimestamp >= overwriteStart && cellTimestamp <= overwriteEnd;
    const isInActualRange = actualStart != null && actualEnd != null && cellTimestamp >= actualStart && cellTimestamp <= actualEnd;
    const isInExpectedRange = expectedStart != null && expectedEnd != null && cellTimestamp >= expectedStart && cellTimestamp <= expectedEnd;

    let backgroundColor = ''; // Default to no background (will inherit)
    let content = '';       // Default to no text

    // --- Determine background and content (logic is the same) ---
    if (isInOverwriteRange) {
        backgroundColor = TIMELINE_COLORS.OVERWRITE;
        content = TIMELINE_MARKERS.OVERWRITE;
    } else if (isInActualRange) {
        backgroundColor = TIMELINE_COLORS.ACTUAL;
        content = TIMELINE_MARKERS.ACTUAL;
    } else if (isInExpectedRange) {
        backgroundColor = TIMELINE_COLORS.EXPECTED;
        content = TIMELINE_MARKERS.EXPECTED;
    }

    // --- Create style object FOR THE TD ---
    const tdStyle = {
        // Apply background color, use 'transparent' or specific default if none applies
        backgroundColor: backgroundColor || 'transparent',
        // You could add other dynamic inline styles here if necessary
    };

    // --- Render the TD directly with the style and content ---
    // NO inner div anymore!
    return (
        <td style={tdStyle}>
            {content} {/* Render the 'E', 'A', 'O' or empty string directly */}
        </td>
    );
});
TimelineCell.displayName = 'TimelineCell';

// --- LeftTable Component ---
function LeftTable({ data }) {
    return (
        <table className="table table-striped left-table"> {/* Matches CSS */}
            <thead className="table-dark">
                <tr>
                    {STATIC_COLUMN_CONFIG.map((col) => (
                        <th key={`left-header-${col.key}`}>{col.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {(!data || data.length === 0) ? (
                    <tr><td colSpan={STATIC_COLUMN_CONFIG.length}>No data available</td></tr>
                ) : (
                    data.map((row, rowIndex) => (
                        <tr key={`left-row-${rowIndex}`}>
                            {STATIC_COLUMN_CONFIG.map((col) => {
                                const cellValue = row[col.key];
                                let displayValue = '-'; // Default

                                if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== "") {
                                    if (col.isDate) {
                                        // Use original parseDate and formatDateMD
                                        const dateObj = parseDate(cellValue);
                                        displayValue = formatDateMD(dateObj);
                                    } else {
                                        displayValue = cellValue;
                                    }
                                }
                                return (
                                    <td key={`left-cell-${rowIndex}-${col.key}`}>
                                        {displayValue}
                                    </td>
                                );
                            })}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}

// --- RightTable Component ---
function RightTable({ data, dateRange }) {
    return (
        <table className="table table-striped right-table"> {/* Matches CSS */}
            <thead className="table-dark">
                 <tr>
                    {(!dateRange || dateRange.length === 0) ? (
                        <th>No Timeline Data</th>
                    ) : (
                         dateRange.map((date, colIndex) => (
                            <th key={`right-header-${colIndex}`}>
                                {formatDateMD(date)} {/* Use original formatDateMD */}
                            </th>
                        ))
                    )}
                </tr>
            </thead>
            <tbody>
                 {(!dateRange || dateRange.length === 0) ? (
                     <tr><td>Please check data source or date fields.</td></tr>
                 ) : (!data || data.length === 0) ? (
                     <tr><td colSpan={dateRange.length}>No project data for timeline</td></tr>
                ) : (
                    data.map((row, rowIndex) => (
                        <tr key={`right-row-${rowIndex}`}>
                            {dateRange.map((date, cellIndex) => (
                                // Use the TimelineCell component defined above
                                <TimelineCell
                                    key={`right-cell-${rowIndex}-${cellIndex}`}
                                    date={date}
                                    rowData={row}
                                />
                            ))}
                        </tr>
                    ))
                 )}
            </tbody>
        </table>
    );
}

// --- ProjectTimelineView Component ---
function ProjectTimelineView({ data }) {
    // Calculate date range using original getDateRange
    const dateRange = React.useMemo(() => getDateRange(data, DATE_RANGE_FIELDS), [data]);

    // --- RE-INTRODUCE JAVASCRIPT HEIGHT SYNC ---
    React.useLayoutEffect(() => { // Or React.useEffect if useLayoutEffect causes issues
      const syncHeights = () => {
          // Use setTimeout to wait for potential rendering updates after initial mount/update
          setTimeout(() => {
              // Select header elements (less critical but good for consistency)
              const leftHeader = document.querySelector('.left-table thead');
              const rightHeader = document.querySelector('.right-table thead');
              if (leftHeader && rightHeader) {
                  // Reset heights first to get natural height
                  leftHeader.style.height = '';
                  rightHeader.style.height = '';
                  const leftHeaderHeight = leftHeader.getBoundingClientRect().height;
                  const rightHeaderHeight = rightHeader.getBoundingClientRect().height;
                  const maxHeaderHeight = Math.max(leftHeaderHeight, rightHeaderHeight);
                   if (maxHeaderHeight > 1) { // Avoid setting tiny heights
                      leftHeader.style.height = `${maxHeaderHeight}px`;
                      rightHeader.style.height = `${maxHeaderHeight}px`;
                  }
              }

              // Select corresponding rows in the bodies
              const leftRows = document.querySelectorAll('.left-table tbody tr');
              const rightRows = document.querySelectorAll('.right-table tbody tr');
              const minLength = Math.min(leftRows.length, rightRows.length);

              for (let i = 0; i < minLength; i++) {
                  const leftRow = leftRows[i];
                  const rightRow = rightRows[i];

                  // Reset heights first to get natural height
                  leftRow.style.height = '';
                  rightRow.style.height = '';

                  // Get calculated heights
                  const leftHeight = leftRow.getBoundingClientRect().height;
                  const rightHeight = rightRow.getBoundingClientRect().height;

                  // Determine the maximum height needed for the row pair
                  const maxHeight = Math.max(leftHeight, rightHeight);

                  // Apply the max height to both rows if it's significant
                  // Only apply if difference is noticeable to avoid unnecessary style changes
                  if (maxHeight > 1 && Math.abs(leftHeight - rightHeight) > 1) {
                       leftRow.style.height = `${maxHeight}px`;
                       rightRow.style.height = `${maxHeight}px`;
                  } else if (maxHeight > 1) {
                      // Optional: Set height even if close, for perfect pixel alignment
                      // If you removed the fixed height from CSS, this might be needed.
                      // If right table still has fixed height in CSS, this might conflict.
                      // Choose based on whether CSS or JS should win.
                      // If CSS has height: 40px, this JS might override it.
                       leftRow.style.height = `${maxHeight}px`;
                       rightRow.style.height = `${maxHeight}px`;
                  }
              }
          }, 50); // Small delay (adjust if needed, 0 might work sometimes)
      };

      syncHeights(); // Run on initial mount and after updates

      // Optional: Add resize listener if window resizing could affect layout
      // window.addEventListener('resize', syncHeights);
      // return () => window.removeEventListener('resize', syncHeights);

    }, [data, dateRange]); // Re-run when data or dateRange changes

    // ... rest of the component (return statement with JSX)
    return (
        // ... JSX structure remains the same ...
        <div>
            <h2 className="mb-4">Project Timeline Overview</h2>
            <div style={{ display: 'flex', width: '100%' }}>
                <div className="left-table-container">
                    <LeftTable data={data} />
                </div>
                <div className="scrollable-right-pane">
                    <div className="right-table-container">
                        <RightTable data={data} dateRange={dateRange} />
                    </div>
                </div>
            </div>
        </div>
    );
} // --- End of ProjectTimelineView Component ---


// --- App Component (Main Application Logic) ---
function App() {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        fetch('./data.json') // Assumes data.json is in the same folder as index.html
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(json => {
                if (Array.isArray(json)) {
                    setData(json);
                } else {
                    console.error("Received data is not an array:", json);
                    throw new Error("Invalid data format received.");
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading or processing data:', error);
                setError(error.message || "Failed to load data.");
                setLoading(false);
            });
    }, []); // Empty dependency array runs only once

    if (loading) {
        return <div className="container-fluid mt-3">Loading project data...</div>;
    }

    if (error) {
        return (
            <div className="container-fluid mt-3">
                <div className="alert alert-danger" role="alert">
                    Error loading data: {error}
                </div>
            </div>
        );
    }

    // Render the main ProjectTimelineView
    return (
        <div className="container-fluid mt-3">
             {/* Use ProjectTimelineView component defined above */}
            <ProjectTimelineView data={data} />
        </div>
    );
}

// --- ReactDOM Rendering (Mount the App) ---
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />); // Render the App component