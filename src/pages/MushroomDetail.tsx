import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMushroomById } from "../data/mushrooms";

export default function MushroomDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const mushroom = getMushroomById(id);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightboxSrc(null), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox]);

  if (!mushroom) {
    return (
      <div className="pageDetail">
        <h1 className="h1">No encontrada</h1>
        <p className="small">No existe una seta con id: {id}</p>
        <Link to="/" className="backLink">
          ← Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="pageDetail">
      <Link to="/" className="backLink">
        ← Volver al catálogo
      </Link>

      <h1 className="h1">{mushroom.nombreComun}</h1>
      <p className="scientific">{mushroom.nombreCientifico}</p>

      <div className="badges" aria-label="Etiquetas">
        <span className={`badge badge--${mushroom.comestibilidad.replace(/\s+/g, "-")}`}>{mushroom.comestibilidad}</span>
        {mushroom.epoca.map((e) => (
          <span key={e} className="badge">{e}</span>
        ))}
      </div>

      <p className="lead">{mushroom.descripcionCorta}</p>

      <section className="section" aria-label="Fotos">
        <h2 className="h2">Fotos (cómo puede variar)</h2>
        {mushroom.imagenes.length > 0 ? (
          <div className="gallery">
            {mushroom.imagenes.map((img, i) => (
              <button
                key={i}
                type="button"
                className="galleryBtn"
                onClick={() => setLightboxSrc(img.src)}
                aria-label={img.alt}
              >
                <img src={img.src} alt={img.alt} loading="lazy" />
              </button>
            ))}
          </div>
        ) : (
          <p className="small">Aún no hay imágenes. Añade fotos en <code>public/images/{mushroom.id}/</code>.</p>
        )}
      </section>

      {lightboxSrc && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
        >
          <button type="button" className="lightboxClose" onClick={closeLightbox} aria-label="Cerrar">
            ×
          </button>
          <img
            src={lightboxSrc}
            alt="Ampliación"
            onClick={(e) => e.stopPropagation()}
            className="lightboxImg"
          />
        </div>
      )}

      {/* No confundir con */}
      {mushroom.confusiones && mushroom.confusiones.length > 0 && (
        <section className="section confusiones" aria-label="No confundir con">
          <h2 className="h2">No confundir con</h2>
          <ul className="confusionesList">
            {mushroom.confusiones.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="h2">Rasgos</h2>
        <ul>
          {mushroom.rasgos.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="h2">Hábitat</h2>
        <ul>
          {mushroom.habitat.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      {mushroom.precauciones && mushroom.precauciones.length > 0 && (
        <section className="section">
          <h2 className="h2">Precauciones</h2>
          <ul>
            {mushroom.precauciones.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
