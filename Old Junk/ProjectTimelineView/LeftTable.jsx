// src/components/ProjectTimelineView/LeftTable.jsx
import React from 'react';
import { STATIC_COLUMN_CONFIG } from '../../config/timelineConfig';
import { formatDateMD, parseValidDate } from '../../utils/dateUtils';

function LeftTable({ data }) {
    // ... (rest of the component logic remains the same as previous refactor)

    return (
        // Ensure classes match your CSS: 'table', 'table-striped', 'left-table'
        <table className="table table-striped left-table">
            <thead className="table-dark">
                {/* Header rendering */}
                 <tr>
                    {STATIC_COLUMN_CONFIG.map((col) => (
                        // Key uses col.key for stability
                        <th key={`left-header-${col.key}`}>{col.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {/* Row and cell rendering (logic unchanged) */}
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
                                        const dateObj = parseValidDate(cellValue);
                                        displayValue = formatDateMD(dateObj);
                                    } else {
                                        displayValue = cellValue;
                                    }
                                }
                                return (
                                    // Key uses col.key for stability
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

export default LeftTable;