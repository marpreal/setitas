import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMushroomById } from "../data/mushrooms";

const SWIPE_THRESHOLD = 50;

export default function MushroomDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const mushroom = getMushroomById(id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);
  const didSwipe = useRef(false);
  const imagenes = mushroom?.imagenes ?? [];
  const currentImg = lightboxIndex !== null && imagenes[lightboxIndex] ? imagenes[lightboxIndex] : null;

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    setLightboxIndex(null);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : i <= 0 ? imagenes.length - 1 : i - 1));
  }, [imagenes.length]);
  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : i >= imagenes.length - 1 ? 0 : i + 1));
  }, [imagenes.length]);

  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    didSwipe.current = false;
  }, []);

  const handleLightboxTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (imagenes.length <= 1) return;
      const endX = e.changedTouches[0].clientX;
      const delta = endX - touchStartX.current;
      if (delta > SWIPE_THRESHOLD) {
        didSwipe.current = true;
        goPrev();
        setTimeout(() => { didSwipe.current = false; }, 400);
      } else if (delta < -SWIPE_THRESHOLD) {
        didSwipe.current = true;
        goNext();
        setTimeout(() => { didSwipe.current = false; }, 400);
      }
    },
    [imagenes.length, goPrev, goNext]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox, lightboxIndex, goPrev, goNext]);

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

      {/* Fotos al principio de la ficha */}
      <section className="section sectionFotosFirst" aria-label="Fotos">
        {mushroom.imagenes.length > 0 ? (
          <div className="gallery gallery--ficha">
            {mushroom.imagenes.map((img, i) => (
              <button
                key={i}
                type="button"
                className="galleryBtn"
                onClick={() => openLightbox(i)}
                aria-label={img.alt}
              >
                <img src={img.src} alt={img.alt} loading="lazy" />
              </button>
            ))}
          </div>
        ) : (
          <div className="galleryPlaceholder">
            <span className="galleryPlaceholderIcon" aria-hidden>🍄</span>
            <p className="small">Aún no hay imágenes. Añade fotos en <code>public/images/{mushroom.id}/</code>.</p>
          </div>
        )}
      </section>

      <h1 className="h1">{mushroom.nombreComun}</h1>
      <p className="scientific">{mushroom.nombreCientifico}</p>

      <div className="badges" aria-label="Etiquetas">
        <span className={`badge badge--${mushroom.comestibilidad.replace(/\s+/g, "-")}`}>{mushroom.comestibilidad}</span>
        {mushroom.epoca.map((e) => (
          <span key={e} className="badge">{e}</span>
        ))}
      </div>

      <p className="lead">{mushroom.descripcionCorta}</p>

      {mushroom.nombresEnEspana && mushroom.nombresEnEspana.length > 0 && (
        <section className="section nombresEspana" aria-label="Nombres en España">
          <h2 className="h2">Nombres en España</h2>
          <p className="small">Cómo se conoce esta seta en distintas zonas:</p>
          <ul className="nombresList">
            {mushroom.nombresEnEspana.map((nombre) => (
              <li key={nombre}>{nombre}</li>
            ))}
          </ul>
        </section>
      )}

      {mushroom.zonas && mushroom.zonas.length > 0 && (
        <section className="section zonasSection" aria-label="Zonas donde se puede encontrar">
          <h2 className="h2">Zonas donde se puede encontrar</h2>
          <ul className="zonasList">
            {mushroom.zonas.map((zona) => (
              <li key={zona}>{zona}</li>
            ))}
          </ul>
        </section>
      )}

      {mushroom.comestibilidad === "comestible" && (mushroom.calidadCulinaria || mushroom.consumoRecomendado?.length || mushroom.propiedades?.length) && (
        <section className="section calidadSection" aria-label="Calidad y consumo">
          <h2 className="h2">Calidad y consumo</h2>
          {mushroom.calidadCulinaria && (
            <p className="small">
              <strong>Nivel de calidad:</strong>{" "}
              <span className={`badge badge-calidad badge-calidad--${mushroom.calidadCulinaria}`}>
                {mushroom.calidadCulinaria === "excelente" && "Excelente"}
                {mushroom.calidadCulinaria === "muy buena" && "Muy buena"}
                {mushroom.calidadCulinaria === "buena" && "Buena"}
                {mushroom.calidadCulinaria === "aceptable" && "Aceptable"}
              </span>
            </p>
          )}
          {mushroom.consumoRecomendado && mushroom.consumoRecomendado.length > 0 && (
            <>
              <h3 className="h3">Cómo consumirla</h3>
              <ul className="consumoList">
                {mushroom.consumoRecomendado.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}
          {mushroom.propiedades && mushroom.propiedades.length > 0 && (
            <>
              <h3 className="h3">Propiedades</h3>
              <ul className="propiedadesList">
                {mushroom.propiedades.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {lightboxIndex !== null && currentImg && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
        >
          <button type="button" className="lightboxClose" onClick={closeLightbox} aria-label="Cerrar">
            ×
          </button>
          {imagenes.length > 1 && (
            <>
              <button type="button" className="lightboxPrev" onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Anterior">
                ‹
              </button>
              <button type="button" className="lightboxNext" onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Siguiente">
                ›
              </button>
              <span className="lightboxCounter" onClick={(e) => e.stopPropagation()}>
                {lightboxIndex + 1} / {imagenes.length}
              </span>
              <span className="lightboxSwipeHint" aria-hidden>Desliza para cambiar</span>
            </>
          )}
          <img
            src={currentImg.src}
            alt={currentImg.alt}
            onClick={(e) => e.stopPropagation()}
            className="lightboxImg"
            draggable={false}
          />
        </div>
      )}

      {/* No confundir con */}
      {mushroom.confusiones && mushroom.confusiones.length > 0 && (
        <section className="section confusiones" aria-label="No confundir con">
          <h2 className="h2">No confundir con</h2>
          <ul className="confusionesList">
            {mushroom.confusiones.map((c, i) => {
              if (typeof c === "string") {
                return <li key={i}>{c}</li>;
              }
              const otra = getMushroomById(c.id);
              const fotos = otra?.imagenes?.slice(0, 2) ?? [];
              return (
                <li key={i} className="confusionesItemConFotos">
                  <div className="confusionesItemText">
                    <Link to={`/seta/${c.id}`} className="confusionesItemLink">
                      {c.texto}
                    </Link>
                    {otra && (
                      <span className="confusionesItemNombre"> → {otra.nombreComun}</span>
                    )}
                  </div>
                  {fotos.length > 0 && (
                    <div className="confusionesFotos">
                      {fotos.map((img, j) => (
                        <Link
                          key={j}
                          to={`/seta/${c.id}`}
                          className="confusionesFotoLink"
                          aria-label={`Ver ficha de ${otra?.nombreComun}`}
                        >
                          <img src={img.src} alt={img.alt} className="confusionesFoto" />
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
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

      {mushroom.masInfo && mushroom.masInfo.length > 0 && (
        <section className="section masInfoSection" aria-label="Más información">
          <h2 className="h2">Más información</h2>
          <div className="masInfoContent">
            {mushroom.masInfo.map((texto, i) => (
              <p key={i} className="masInfoP">{texto}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
