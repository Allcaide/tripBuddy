import './ViewControls.css';

export default function ViewControls({ view, onViewChange, onSortChange }) {
  return (
    <div className="view-controls">
      <div className="view-controls__slider">
        <span className="view-controls__label">VIEW</span>
        <div className="view-controls__track">
          <button
            className={`view-controls__dot ${view === 'large' ? 'view-controls__dot--active' : ''}`}
            onClick={() => onViewChange('large')}
            aria-label="Large view"
          />
          <button
            className={`view-controls__dot ${view === 'grid' ? 'view-controls__dot--active' : ''}`}
            onClick={() => onViewChange('grid')}
            aria-label="Grid view"
          />
        </div>
      </div>
      <div className="view-controls__right">
        <button className="view-controls__btn">FILTERS</button>
        <span className="view-controls__sep">|</span>
        <select
          className="view-controls__sort"
          onChange={(e) => onSortChange?.(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>SORT</option>
          <option value="price">Preço ↑</option>
          <option value="-price">Preço ↓</option>
          <option value="-ratingsAverage">Avaliação</option>
          <option value="-createdAt">Novidades</option>
        </select>
      </div>
    </div>
  );
}
