// src/components/ProjectTimelineView/RightTable.jsx
import React from 'react';
import TimelineCell from './TimelineCell';
import { formatDateMD } from '../../utils/dateUtils';

function RightTable({ data, dateRange }) {
    // ... (rest of the component logic remains the same as previous refactor)

    return (
        // Ensure classes match your CSS: 'table', 'table-striped', 'right-table'
        <table className="table table-striped right-table">
            <thead className="table-dark">
                {/* Header rendering (logic unchanged) */}
                 <tr>
                    {(!dateRange || dateRange.length === 0) ? (
                        <th>No Timeline Data</th>
                    ) : (
                         dateRange.map((date, colIndex) => (
                            <th key={`right-header-${colIndex}`}>
                                {formatDateMD(date)}
                            </th>
                        ))
                    )}
                </tr>
            </thead>
            <tbody>
                {/* Row and cell rendering using TimelineCell (logic unchanged) */}
                 {(!dateRange || dateRange.length === 0) ? (
                     <tr><td>Please check data source or date fields.</td></tr>
                 ) : (!data || data.length === 0) ? (
                     <tr><td colSpan={dateRange.length}>No project data for timeline</td></tr>
                ) : (
                    data.map((row, rowIndex) => (
                        <tr key={`right-row-${rowIndex}`}>
                            {dateRange.map((date, cellIndex) => (
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

export default RightTable;