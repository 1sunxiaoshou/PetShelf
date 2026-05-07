export function SortControls({ activeSort, onSortChange, options }) {
  return (
    <div className="sort-row" aria-label="排序方式">
      {options.map((option) => (
        <button
          key={option.id}
          aria-pressed={activeSort === option.id}
          className={activeSort === option.id ? "sort-pill active" : "sort-pill"}
          type="button"
          onClick={() => onSortChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
