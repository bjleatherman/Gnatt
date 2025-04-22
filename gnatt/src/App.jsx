import Combobox from './components/Combobox.jsx';
import tasks from './data/tasks.js';

function App() {
  // Step 1: Get earliest and latest dates
  const allDates = tasks.flatMap(task => [task.expectedStart, task.expectedEnd]);
  const minDate = new Date(Math.min(...allDates.map(date => new Date(date))));
  const maxDate = new Date(Math.max(...allDates.map(date => new Date(date))));

  // Step 2: Build date range array
  const dateRange = [];
  const currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="fw-bold text-primary">📊 Gantt Chart Project</h1>
        <p className="text-muted">Project timelines and phases overview</p>
      </div>

      {/* Table */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <table className="table table-hover align-middle table-striped">
            <thead className="table-dark">
              <tr>
                <th>Analyst</th>
                <th>Phase</th>
                <th>Expected Start</th>
                <th>Actual Start</th>
                <th>Expected End</th>
                <th>Actual End</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={index}>
                  <td>
                    {/* <span className="fw-medium"> */}
                      <Combobox initialValue={task.analyst}/>
                    {/* </span> */}
                  </td>
                  <td>
                    <span className={`badge ${
                      task.phase === 'Planning' ? 'bg-info' :
                      task.phase === 'Execution' ? 'bg-success' :
                      task.phase === 'Review' ? 'bg-warning text-dark' :
                      task.phase === 'Deployment' ? 'bg-secondary' :
                      task.phase === 'Maintenance' ? 'bg-dark' :
                      'bg-light text-dark'
                    }`}>
                      {task.phase}
                    </span>
                  </td>
                  <td>{task.expectedStart}</td>
                  <td>{task.actualStart}</td>
                  <td>{task.expectedEnd}</td>
                  <td>{task.actualEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gantt Chart */}
      <div>
        <h2 className="mb-4">🗓️ Timeline View</h2>

        {/* Date Headers */}
        <div className="d-flex border-bottom mb-3 position-relative" style={{ paddingLeft: "150px" }}>
          {dateRange.map(date => (
            <div
              key={date.toISOString()}
              className="text-center small text-muted border-end"
              style={{ width: "40px", flexShrink: 0 }}
            >
              <div>{date.getDate()}</div>
              <div className="text-lowercase" style={{ fontSize: "10px" }}>
                {date.toLocaleString('default', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Task Bars */}
        {tasks.map(task => {
          const start = new Date(task.expectedStart);
          const end = new Date(task.expectedEnd);
          const offsetDays = Math.floor((start - minDate) / (1000 * 60 * 60 * 24));
          const durationDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

          const phaseColor = {
            Planning: '#0dcaf0',
            Execution: '#198754',
            Review: '#ffc107',
            Deployment: '#6c757d',
            Maintenance: '#212529',
          }[task.phase] || '#dee2e6';

          return (
            <div className="d-flex align-items-center mb-3" key={task.analyst + task.phase}>
              {/* Task label */}
              <div style={{ width: "150px", textAlign: "right", paddingRight: "1rem" }} className="fw-medium text-secondary">
                {task.analyst}
              </div>

              {/* Gantt bar container */}
              <div className="d-flex align-items-center position-relative" style={{ flex: 1 }}>
                {/* Empty space before the bar */}
                <div style={{ width: `${offsetDays * 40}px`, flexShrink: 0 }}></div>

                {/* Task duration bar */}
                <div
                  className="position-relative"
                  style={{
                    width: `${durationDays * 40}px`,
                    height: "24px",
                    backgroundColor: phaseColor,
                    borderRadius: "4px",
                    transition: "all 0.3s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                  }}
                  title={`${task.phase}: ${task.expectedStart} → ${task.expectedEnd}`}
                >
                  <div className="text-white text-center small" style={{ lineHeight: "24px" }}>
                    {task.phase}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
