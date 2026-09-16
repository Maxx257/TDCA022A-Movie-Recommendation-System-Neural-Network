import { useEffect, useRef, useState } from "react";


function FilterDropdown({
  id,
  value,
  onChange,
  options,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  const selectedOption = options.find(
    (option) =>
      String(option.value) === String(value)
  );


  return (
    <div
      ref={dropdownRef}
      className={`relative ${
        open ? "z-[100]" : "z-10"
      }`}
    >

      <button
        id={id}
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-zinc-900/70 px-4 py-3 text-left text-sm text-white outline-none transition hover:border-white/20 focus:border-white/30 focus:ring-2 focus:ring-white/5"
      >
        <span className="truncate">
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <span
          className={`ml-3 shrink-0 text-xs text-zinc-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>


      {open && (
        <div className="absolute left-0 top-full z-[110] mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl shadow-black/70">

          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
              value === ""
                ? "bg-white/10 text-white"
                : "text-zinc-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {placeholder}
          </button>


          {options.map((option) => {
            const selected =
              String(option.value) ===
              String(value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "bg-white/10 text-white"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}

        </div>
      )}

    </div>
  );
}


export default FilterDropdown;