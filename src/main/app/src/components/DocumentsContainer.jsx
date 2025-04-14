// components/DocumentsContainer.jsx
import React, { useState } from 'react';
import DocumentGrid from './DocumentGrid';
import DocumentList from './DocumentList';
import ViewToggle from './ViewToggle';

const DocumentsContainer = ({ documents, isLoading, onDocumentsUpdate }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const handleViewChange = (view) => {
    setViewMode(view);
  };

  return (
    <div className="documents-container">
      <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />

      {viewMode === 'grid' ? (
        <DocumentGrid
          documents={documents}
          isLoading={isLoading}
          onDocumentsUpdate={onDocumentsUpdate}
        />
      ) : (
        <DocumentList
          documents={documents}
          isLoading={isLoading}
          onDocumentsUpdate={onDocumentsUpdate}
        />
      )}
    </div>
  );
};

export default DocumentsContainer;