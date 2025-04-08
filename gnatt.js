function parseDate(dateStr) {
    if (!dateStr || dateStr.trim() === "") return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}
function getDateRange(data) {
    const dateFields = ["expectedStart", "actualStart", "userOverwriteStart", "expectedEnd", "clientAgreedEnd", "userOverwriteEnd", "actualEnd"];
    const dates = data.flatMap(row => dateFields.map(field => parseDate(row[field])).filter(date => date !== null));
    if (dates.length === 0) return [];
    dates.sort((a, b) => a.getTime() - b.getTime());
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const range = [];
    let limit = 365;
    let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    while (currentDate <= maxDate && limit > 0) {
        range.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        limit--;
    }
    return range;
}
function formatDateMD(dateString) {
    const date = parseDate(dateString);
    if (!date) return dateString;
    if (dateString === '-') return '-';
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}


// --- ProjectTable Component ---
function ProjectTable({ data }) {
    const dateRange = React.useMemo(() => getDateRange(data), [data]);
    const staticHeaders = ["Expected Start", "Actual Start", "User Overwrite Start", "Expected End", "Client Agreed End", "User Overwrite End", "Actual End", "Analyst", "Phase"];
    const staticCellKeys = ["expectedStart", "actualStart", "userOverwriteStart", "expectedEnd", "clientAgreedEnd", "userOverwriteEnd", "actualEnd", "analyst", "phase"];

    React.useEffect(() => {
      const syncHeights = () => {
          setTimeout(() => {
              const leftHeader = document.querySelector('.left-table thead');
              const rightHeader = document.querySelector('.right-table thead');
              if (leftHeader && rightHeader) {
                  leftHeader.style.height = ''; rightHeader.style.height = '';
                  const leftHeaderHeight = leftHeader.getBoundingClientRect().height;
                  const rightHeaderHeight = rightHeader.getBoundingClientRect().height;
                  const maxHeaderHeight = Math.max(leftHeaderHeight, rightHeaderHeight);
                   if (maxHeaderHeight > 1) {
                      leftHeader.style.height = `${maxHeaderHeight}px`;
                      rightHeader.style.height = `${maxHeaderHeight}px`;
                  }
              }
              const leftRows = document.querySelectorAll('.left-table tbody tr');
              const rightRows = document.querySelectorAll('.right-table tbody tr');
              const minLength = Math.min(leftRows.length, rightRows.length);
              for (let i = 0; i < minLength; i++) {
                  const leftRow = leftRows[i]; const rightRow = rightRows[i];
                  leftRow.style.height = ''; rightRow.style.height = '';
                  const leftHeight = leftRow.getBoundingClientRect().height;
                  const rightHeight = rightRow.getBoundingClientRect().height;
                  const maxHeight = Math.max(leftHeight, rightHeight);
                  if (maxHeight > 1) {
                      if (Math.abs(leftHeight - rightHeight) > 1) {
                          leftRow.style.height = `${maxHeight}px`;
                          rightRow.style.height = `${maxHeight}px`;
                      } else {
                           leftRow.style.height = `${maxHeight}px`;
                           rightRow.style.height = `${maxHeight}px`;
                      }
                  }
              }
          }, 50);
      };
      syncHeights();
    }, [data, dateRange]);

    return (
      <div>
        <h2 className="mb-4">Project Timeline Overview</h2>
        <div style={{ display: "flex", width: "100%" }}>
          <div className="left-table-container">
            {/* REMOVED 'table-bordered' from className */}
            <table className="table table-striped left-table">
              <thead className="table-dark">
                <tr>
                  {staticHeaders.map((header, i) => (
                    <th key={`left-header-${i}`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <tr key={`left-row-${rowIndex}`}>
                       {staticCellKeys.map((key, cellIndex) => {
                           const isDateField = key.toLowerCase().includes('start') || key.toLowerCase().includes('end');
                           let cellValue = row[key];
                           if (!cellValue || String(cellValue).trim() === "") { cellValue = '-'; }
                           const displayValue = (isDateField && cellValue !== '-') ? formatDateMD(cellValue) : cellValue;
                           return (<td key={`left-cell-${rowIndex}-${cellIndex}`}>{displayValue}</td>);
                       })}
                    </tr>
                  ))
                ) : ( <tr><td colSpan={staticHeaders.length}>No data available</td></tr> )}
              </tbody>
            </table>
          </div>

          <div className="scrollable-right-pane">
              <div className="right-table-container">
                  {/* REMOVED 'table-bordered' from className */}
                  <table className="table table-striped right-table">
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
                                          const cellTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                                          const expectedStart = parseDate(row.expectedStart)?.getTime();
                                          const expectedEnd = parseDate(row.expectedEnd)?.getTime();
                                          const actualStart = parseDate(row.actualStart)?.getTime();
                                          const actualEnd = parseDate(row.actualEnd)?.getTime();
                                          const overwriteStart = parseDate(row.userOverwriteStart)?.getTime();
                                          const overwriteEnd = parseDate(row.userOverwriteEnd)?.getTime();
                                          const isInExpectedRange = expectedStart != null && expectedEnd != null && cellTimestamp >= expectedStart && cellTimestamp <= expectedEnd;
                                          const isInActualRange = actualStart != null && actualEnd != null && cellTimestamp >= actualStart && cellTimestamp <= actualEnd;
                                          const isInOverwriteRange = overwriteStart != null && overwriteEnd != null && cellTimestamp >= overwriteStart && cellTimestamp <= overwriteEnd;
                                          let backgroundColor = ''; let content = '';
                                          if (isInOverwriteRange) { backgroundColor = '#fde68a'; content = 'O'; }
                                          else if (isInActualRange) { backgroundColor = '#fca5a5'; content = 'A'; }
                                          else if (isInExpectedRange) { backgroundColor = '#d1e7dd'; content = 'E'; }
                                          return (
                                              <td key={`right-cell-${rowIndex}-${cellIndex}`}>
                                                  {content && (
                                                      <div style={{ width: '100%', height: '50%', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor, borderRadius: '2px' }}>
                                                          {content}
                                                      </div>
                                                  )}
                                              </td>
                                          );
                                      })}
                                  </tr>
                              ))
                          ) : ( <tr><td colSpan={dateRange.length || 1}>No timeline data available</td></tr> )}
                      </tbody>
                  </table>
              </div>
          </div>
        </div>
      </div>
    );
} // --- End of ProjectTable Component ---


// --- App Component ---
function App() {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      fetch('./data.json')
        .then(response => {
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            return response.json();
        })
        .then(json => {
            if (Array.isArray(json)) { setData(json); }
            else { throw new Error("Invalid data format received from server."); }
            setLoading(false);
        })
        .catch(error => {
            console.error('Error loading or processing data:', error);
            setError(error.message || "Failed to load data.");
            setLoading(false);
        });
    }, []);

    if (loading) { return <div className="container-fluid mt-3">Loading project data...</div>; }
    if (error) { return <div className="container-fluid mt-3 alert alert-danger">Error loading data: {error}</div>; }

    return (
      <div className="container-fluid mt-3">
        <ProjectTable data={data} />
      </div>
    );
} // --- End of App Component ---

// --- ReactDOM Rendering ---
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);