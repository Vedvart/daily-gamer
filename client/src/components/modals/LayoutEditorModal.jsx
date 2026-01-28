// LayoutEditorModal Component
// Modal for reordering and toggling section visibility

import { useState, useEffect } from 'react';
import './LayoutEditorModal.css';

const SECTION_LABELS = {
  'pinned-games': 'Featured Games',
  'daily-leaderboard': 'Daily Leaderboard',
  'historical-leaderboard': 'All-Time Leaderboard',
  'discussions': 'Discussions',
  'members': 'Members'
};

function LayoutEditorModal({ isOpen, onClose, sections, onSave }) {
  const [localSections, setLocalSections] = useState([]);

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen && sections) {
      // Sort by order
      setLocalSections([...sections].sort((a, b) => a.order - b.order));
    }
  }, [isOpen, sections]);

  const handleToggleVisibility = (sectionType) => {
    setLocalSections(prev => prev.map(s =>
      s.type === sectionType ? { ...s, visible: !s.visible } : s
    ));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setLocalSections(prev => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      // Update order values
      return newSections.map((s, i) => ({ ...s, order: i }));
    });
  };

  const handleMoveDown = (index) => {
    if (index === localSections.length - 1) return;
    setLocalSections(prev => {
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      // Update order values
      return newSections.map((s, i) => ({ ...s, order: i }));
    });
  };

  const handleSave = () => {
    onSave(localSections);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="layout-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Layout</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="layout-editor-content">
          <p className="layout-editor-hint">
            Drag to reorder sections. Toggle visibility with the eye icon.
          </p>

          <div className="layout-editor-list">
            {localSections.map((section, index) => (
              <div
                key={section.type}
                className={`layout-editor-item ${!section.visible ? 'hidden' : ''}`}
              >
                <div className="layout-editor-item__main">
                  <span className="layout-editor-item__order">{index + 1}</span>
                  <span className="layout-editor-item__name">
                    {SECTION_LABELS[section.type] || section.type}
                  </span>
                </div>

                <div className="layout-editor-item__actions">
                  <button
                    className="layout-btn"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="layout-btn"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === localSections.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    className={`layout-btn layout-btn--visibility ${section.visible ? 'visible' : ''}`}
                    onClick={() => handleToggleVisibility(section.type)}
                    title={section.visible ? 'Hide section' : 'Show section'}
                  >
                    {section.visible ? '👁' : '👁‍🗨'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Layout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LayoutEditorModal;
