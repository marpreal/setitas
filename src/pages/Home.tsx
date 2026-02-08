import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { COMESTIBILIDAD_OPTIONS, MUSHROOMS, type Comestibilidad, type Mushroom } from "../data/mushrooms";

type Filters = {
  q: string;
  comestibilidad: "" | Comestibilidad;
  habitat: string;
  epoca: string;
};

function normalize(s: string) {
  return s.trim().toLocaleLowerCase("es-ES");
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "es-ES"));
}

export default function Home() {
  const [filters, setFilters] = useState<Filters>({
    q: "",
    comestibilidad: "",
    habitat: "",
    epoca: ""
  });

  const habitatOptions = useMemo(() => {
    const all = MUSHROOMS.flatMap((m) => m.habitat);
    return uniqueSorted(all);
  }, []);

  const epocaOptions = useMemo(() => {
    const all = MUSHROOMS.flatMap((m) => m.epoca);
    return uniqueSorted(all);
  }, []);

  const safeComestibilidad =
    filters.comestibilidad === "" || COMESTIBILIDAD_OPTIONS.includes(filters.comestibilidad)
      ? filters.comestibilidad
      : "";

  const results = useMemo(() => {
    const q = normalize(filters.q);
    return MUSHROOMS.filter((m) => {
      const matchesQuery =
        q.length === 0 ||
        normalize(m.nombreComun).includes(q) ||
        normalize(m.nombreCientifico).includes(q);
      const matchesCom = safeComestibilidad === "" || m.comestibilidad === safeComestibilidad;
      const matchesHab =
        filters.habitat === "" || m.habitat.some((h) => normalize(h) === normalize(filters.habitat));
      const matchesEpo =
        filters.epoca === "" || m.epoca.some((e) => normalize(e) === normalize(filters.epoca));
      return matchesQuery && matchesCom && matchesHab && matchesEpo;
    });
  }, [filters.q, filters.habitat, filters.epoca, safeComestibilidad]);

  return (
    <div className="pageHome">
      <h1 className="h1">Catálogo</h1>
      <p className="small">Busca por nombre y filtra por comestibilidad, hábitat y época.</p>

      <form
        className="controls"
        aria-label="Búsqueda y filtros"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="field">
          <label htmlFor="q">Buscar</label>
          <input
            id="q"
            type="text"
            value={filters.q}
            onChange={(e) => {
              const value = String((e.target as HTMLInputElement | null)?.value ?? "");
              setFilters((f) => ({ ...f, q: value }));
            }}
            placeholder="Ej.: níscalo, boletus, amanita…"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="com">Comestibilidad</label>
          <select
            id="com"
            value={safeComestibilidad}
            onChange={(e) => {
              const v = String((e.target as HTMLSelectElement | null)?.value ?? "");
              setFilters((f) => ({
                ...f,
                comestibilidad: (v === "" ? "" : v) as Filters["comestibilidad"]
              }));
            }}
          >
            <option value="">Todas</option>
            {COMESTIBILIDAD_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="hab">Hábitat</label>
          <select
            id="hab"
            value={filters.habitat}
            onChange={(e) => {
              const value = String((e.target as HTMLSelectElement | null)?.value ?? "");
              setFilters((f) => ({ ...f, habitat: value }));
            }}
          >
            <option value="">Todos</option>
            {habitatOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="epo">Época</label>
          <select
            id="epo"
            value={filters.epoca}
            onChange={(e) => {
              const value = String((e.target as HTMLSelectElement | null)?.value ?? "");
              setFilters((f) => ({ ...f, epoca: value }));
            }}
          >
            <option value="">Todas</option>
            {epocaOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </form>

      <hr className="sep" />

      <p className="small" aria-live="polite">
        Mostrando <strong>{results.length}</strong> de <strong>{MUSHROOMS.length}</strong>
      </p>

      <section className="grid" aria-label="Resultados">
        {results.map((m) => (
          <MushroomCard key={m.id} mushroom={m} />
        ))}
      </section>
    </div>
  );
}

function MushroomCard({ mushroom }: { mushroom: Mushroom }) {
  const cover = mushroom.imagenes[0];

  return (
    <article className="card">
      <div className="coverWrap">
        {cover ? (
          <img className="cover" src={cover.src} alt={cover.alt} loading="lazy" />
        ) : (
          <div className="cover cover--placeholder" aria-label="Sin imagen" />
        )}
      </div>
      <div className="cardBody">
        <h2 className="h2">{mushroom.nombreComun}</h2>
        <p className="small">
          <em>{mushroom.nombreCientifico}</em>
        </p>
        <div className="badges" aria-label="Etiquetas">
          <span className={`badge badge--${mushroom.comestibilidad.replace(/\s+/g, "-")}`}>{mushroom.comestibilidad}</span>
          {mushroom.epoca.slice(0, 2).map((e) => (
            <span key={e} className="badge">
              {e}
            </span>
          ))}
        </div>
        <p className="small">{mushroom.descripcionCorta}</p>
        <Link to={`/seta/${mushroom.id}`} className="cardLink" aria-label={`Ver ficha de ${mushroom.nombreComun}`}>
          Ver ficha →
        </Link>
      </div>
    </article>
  );
}
