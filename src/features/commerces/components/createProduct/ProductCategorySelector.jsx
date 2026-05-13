import { useMemo } from "react";

function CategoryChip({ name, onRemove, disabled }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 mr-2 mb-2">
      {name}
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="font-bold text-emerald-700 hover:text-emerald-900"
          aria-label={`Remover ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

const MAX_CATEGORIES = 3;

export function ProductCategorySelector({
  categories,
  selectedIds,
  onChange,
  disabled,
  error,
  label = "Categorías *",
}) {
  const selectedValues = useMemo(
    () => (Array.isArray(selectedIds) ? selectedIds.map(String) : []),
    [selectedIds]
  );

  const getCategoryId = (category) => category.id;

  return (
    <div>
      <label className="mb-2 block text-[14px] font-semibold text-[#273830]">
        {label}
      </label>

      <div className="mb-2 min-h-8 flex flex-wrap items-center gap-1">
        {selectedValues.length > 0 ? (
          selectedValues.map((selectedId) => {
            const category = categories.find((item) => {
              const categoryId = getCategoryId(item);
              return String(categoryId) === selectedId;
            });

            if (!category) {
              return null;
            }

            const categoryId = String(getCategoryId(category));

            return (
              <CategoryChip
                key={categoryId}
                name={category.name}
                disabled={disabled}
                onRemove={() => {
                  onChange({
                    target: {
                      name: "categoryIds",
                      value: selectedValues.filter((value) => value !== categoryId),
                    },
                  });
                }}
              />
            );
          })
        ) : (
          <span className="text-sm text-gray-400">Sin categorías seleccionadas</span>
        )}
      </div>

      <div
        className={`max-h-64 overflow-y-auto rounded-md border bg-white ${
          error ? "border-red-300 bg-red-50" : "border-gray-200"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {categories.map((category) => {
          const categoryId = String(getCategoryId(category));
          const isSelected = selectedValues.includes(categoryId);

          return (
            <label
              key={categoryId}
              className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={disabled || (!isSelected && selectedValues.length >= MAX_CATEGORIES)}
                onChange={() => {
                  const nextValue = isSelected
                    ? selectedValues.filter((value) => value !== categoryId)
                    : [...selectedValues, categoryId];

                  onChange({
                    target: {
                      name: "categoryIds",
                      value: nextValue,
                    },
                  });
                }}
                className="h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="ml-1 text-sm text-gray-700">{category.name}</span>
            </label>
          );
        })}
      </div>

      <p className="mt-1 text-xs text-gray-500">
        Podés seleccionar hasta {MAX_CATEGORIES} categorías.
        {selectedValues.length >= MAX_CATEGORIES && (
          <span className="ml-1 font-semibold text-amber-600">Límite alcanzado.</span>
        )}
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}