// GroupSection Component
// Wrapper for sections in the group page

import './GroupSection.css';

function GroupSection({ title, children, actions }) {
  return (
    <section className="group-section">
      <div className="group-section__header">
        <h2 className="group-section__title">{title}</h2>
        {actions && (
          <div className="group-section__actions">
            {actions}
          </div>
        )}
      </div>
      <div className="group-section__content">
        {children}
      </div>
    </section>
  );
}

export default GroupSection;
