// src/components/ProjectTimelineView/TimelineCell.jsx
import React from 'react';
import { startOfDay } from 'date-fns';
import { parseValidDate } from '../../utils/dateUtils';
import { TIMELINE_COLORS, TIMELINE_MARKERS } from '../../config/timelineConfig';

const TimelineCell = React.memo(({ date, rowData }) => {
    // ... (Date parsing and logic to determine color/content remains the same)
    const cellTimestamp = startOfDay(date).getTime();
    const expectedStart = parseValidDate(rowData.expectedStart)?.getTime();
    const expectedEnd = parseValidDate(rowData.expectedEnd)?.getTime();
    const actualStart = parseValidDate(rowData.actualStart)?.getTime();
    const actualEnd = parseValidDate(rowData.actualEnd)?.getTime();
    const overwriteStart = parseValidDate(rowData.userOverwriteStart)?.getTime();
    const overwriteEnd = parseValidDate(rowData.userOverwriteEnd)?.getTime();

    const isInOverwriteRange = overwriteStart != null && overwriteEnd != null && cellTimestamp >= overwriteStart && cellTimestamp <= overwriteEnd;
    const isInActualRange = actualStart != null && actualEnd != null && cellTimestamp >= actualStart && cellTimestamp <= actualEnd;
    const isInExpectedRange = expectedStart != null && expectedEnd != null && cellTimestamp >= expectedStart && cellTimestamp <= expectedEnd;

    let backgroundColor = '';
    let content = '';

    if (isInOverwriteRange) { /* ... set color/content ... */ }
    else if (isInActualRange) { /* ... set color/content ... */ }
    else if (isInExpectedRange) { /* ... set color/content ... */ }
     // ... logic from previous refactor ...
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

    return (
        // TD structure matches the CSS (.right-table tbody td)
        <td>
            {content && (
                // Inner div matches CSS (.right-table tbody td > div)
                // Using inline style for background as it's dynamic per cell
                <div
                  style={{
                      backgroundColor,
                      width: '90%', // Example style - adjust if needed based on CSS
                      height: '70%',// Example style - adjust if needed based on CSS
                      margin: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '3px',
                      fontSize: 'inherit', // Inherit from TD or set specifically
                      fontWeight: 'bold',
                      lineHeight: 1,      // Matches CSS rule
                      boxSizing: 'border-box'
                    }}
                >
                    {content}
                </div>
            )}
        </td>
    );
});

TimelineCell.displayName = 'TimelineCell';
export default TimelineCell;