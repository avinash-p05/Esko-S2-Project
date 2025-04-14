import React from 'react';
import './ViewToggle.css';

const ViewToggle = ({ currentView, onViewChange }) => {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-button ${currentView === 'grid' ? 'active' : ''}`}
        onClick={() => onViewChange('grid')}
        title="Grid View"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-large">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </button>

      <button
        className={`view-toggle-button ${currentView === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
        title="List View"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-large">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>

      <style jsx>{`
        .view-toggle {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 16px;
        }

        .view-toggle-button {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .view-toggle-button:first-child {
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
        }

        .view-toggle-button:last-child {
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }

        .view-toggle-button.active {
          background-color: #444b54;
          color: white;
          border-color: #444b54;
        }

        .view-toggle-button:hover:not(.active) {
          background-color: #e5e7eb;
        }

        .icon-large {
          width: 28px;
          height: 28px;
        }
      `}</style>
    </div>
  );
};

export default ViewToggle;