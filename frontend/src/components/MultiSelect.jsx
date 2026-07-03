import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function MultiSelect({ label, options, selected, onChange, disabled, disabledHint }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="filter-field" ref={ref}>
      <div className="filter-label-row">
        <label className="filter-label">{label}</label>
        {selected.length > 0 && (
          <button
            type="button"
            className="filter-clear"
            onClick={() => onChange([])}
            aria-label={`Clear ${label} filter`}
          >
            clear
          </button>
        )}
      </div>

      <button
        type="button"
        className="filter-trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        title={disabled ? disabledHint : undefined}
      >
        <span className="filter-trigger-text">
          {disabled
            ? disabledHint
            : selected.length === 0
            ? "All"
            : selected.length === 1
            ? selected[0]
            : `${selected.length} selected`}
        </span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      {open && !disabled && (
        <div className="filter-panel">
          {options.length === 0 && <div className="filter-empty">No options</div>}
          {options.map((opt) => (
            <label key={opt} className="filter-option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="filter-chips">
          {selected.map((s) => (
            <span className="filter-chip" key={s}>
              {s}
              <button
                type="button"
                onClick={() => toggle(s)}
                aria-label={`Remove ${s}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
