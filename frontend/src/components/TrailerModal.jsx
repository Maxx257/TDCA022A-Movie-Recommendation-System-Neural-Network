import { useEffect } from "react";


function TrailerModal({
  trailer,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [onClose]);


  if (!trailer) {
    return null;
  }


  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
      onClick={onClose}
    >

      <div
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

          <div className="min-w-0">

            <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
              Trailer
            </p>

            <h2 className="mt-1 truncate text-lg font-semibold text-white">
              {trailer.name}
            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-zinc-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close trailer"
          >
            ×
          </button>

        </div>


        {/* Video */}
        <div className="aspect-video w-full bg-black">

          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
            title={trailer.name}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />

        </div>

      </div>

    </div>
  );
}


export default TrailerModal;