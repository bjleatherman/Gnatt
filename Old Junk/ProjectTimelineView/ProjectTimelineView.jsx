// src/components/ProjectTimelineView/ProjectTimelineView.jsx
import React from 'react';
import LeftTable from './LeftTable';
import RightTable from './RightTable';
import { getDateRange } from '../../utils/dateUtils';
import { DATE_RANGE_FIELDS } from '../../config/timelineConfig';
// Assuming your provided CSS is saved here:
import '../../styles/timeline-styles.css'; // <-- Adjust this path/filename if needed

function ProjectTimelineView({ data }) {
    // Calculate date range only when data changes
    const dateRange = React.useMemo(() => getDateRange(data, DATE_RANGE_FIELDS), [data]);

    // --- NO MORE useEffect for height synchronization ---
    // All layout and alignment relies on the imported CSS file.
    // Note: Based on the provided CSS (fixed height on right, variable on left),
    // rows may not align perfectly if left cell content wraps excessively.

    return (
        <div>
            {/* Assuming h2 is styled globally or via Bootstrap */}
            <h2 className="mb-4">Project Timeline Overview</h2>

            {/* Container matching the flex setup implied by your CSS rules */}
            <div style={{ display: 'flex', width: '100%' }}> {/* Add this wrapper if not already present */}

                {/* Left Pane Container (matches your CSS selector) */}
                <div className="left-table-container">
                    {/* LeftTable component will render the <table className="left-table..."> */}
                    <LeftTable data={data} />
                </div>

                {/* Right Scrollable Pane (matches your CSS selector) */}
                <div className="scrollable-right-pane">
                    {/* Inner container (matches your CSS selector) */}
                    <div className="right-table-container">
                        {/* RightTable component will render the <table className="right-table..."> */}
                        <RightTable data={data} dateRange={dateRange} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectTimelineView;