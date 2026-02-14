import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { COMESTIBILIDAD_OPTIONS, getMushrooms } from "../data/mushrooms";

type QuizMode = "nombre" | "cientifico" | "comestible";

const STORAGE_KEY_LEVEL = "setitas-quiz-level";
const STORAGE_KEY_HISTORY = "setitas-quiz-history";
const MAX_HISTORY = 50;
const HISTORY_DISPLAY = 12;

type QuizLevel = 1 | 2 | 3;

const QUESTIONS_BY_LEVEL: Record<QuizLevel, number> = { 1: 5, 2: 7, 3: 10 };
const OPTIONS_BY_LEVEL: Record<QuizLevel, number> = { 1: 4, 2: 5, 3: 5 };

export type QuizHistoryEntry = {
  mode: QuizMode;
  level: QuizLevel;
  score: number;
  total: number;
  date: string;
};

function getStoredLevel(mode: QuizMode): QuizLevel {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_LEVEL}-${mode}`);
    const n = raw ? parseInt(raw, 10) : 1;
    if (n >= 1 && n <= 3) return n as QuizLevel;
  } catch (_) {}
  return 1;
}

function setStoredLevel(mode: QuizMode, level: QuizLevel): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_LEVEL}-${mode}`, String(level));
  } catch (_) {}
}

function getQuizHistory(): QuizHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as QuizHistoryEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

function addQuizResult(entry: QuizHistoryEntry): void {
  const history = getQuizHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
  } catch (_) {}
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

const MODE_LABELS: Record<QuizMode, string> = {
  nombre: "¿Cómo se llama?",
  cientifico: "¿Nombre científico?",
  comestible: "¿Es comestible?",
};

export default function Quiz() {
  const mushrooms = useMemo(() => getMushrooms(), []);
  const withImages = useMemo(
    () => mushrooms.filter((m) => m.imagenes.length > 0),
    [mushrooms]
  );

  const [mode, setMode] = useState<QuizMode | null>(null);
  const [level, setLevel] = useState<QuizLevel>(1);
  const [roundStarted, setRoundStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const savedThisRound = useRef(false);

  useEffect(() => {
    setHistory(getQuizHistory());
  }, [roundStarted, mode]);

  useEffect(() => {
    if (!roundStarted) savedThisRound.current = false;
  }, [roundStarted]);

  const pool = mode === "comestible" ? mushrooms : withImages;
  const canStart = pool.length >= 5;

  const questionsPerRound = mode ? QUESTIONS_BY_LEVEL[level] : 5;
  const numOptions = mode && (mode === "nombre" || mode === "cientifico")
    ? OPTIONS_BY_LEVEL[level]
    : 4;

  const questions = useMemo(() => {
    if (!mode || pool.length < 2) return [];
    const count = Math.min(questionsPerRound, pool.length);
    return shuffle(pool).slice(0, count);
  }, [mode, pool, questionsPerRound]);

  const current = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;

  // Guardar resultado al terminar la ronda (aunque no pulse "Jugar de nuevo")
  useEffect(() => {
    if (revealed && isLastQuestion && mode && questions.length > 0 && !savedThisRound.current) {
      savedThisRound.current = true;
      addQuizResult({ mode, level, score, total: questions.length, date: new Date().toISOString() });
      setHistory(getQuizHistory());
      if (score === questions.length && level < 3) setStoredLevel(mode, (level + 1) as QuizLevel);
    }
  }, [revealed, isLastQuestion, mode, level, score, questions.length]);

  const questionData = useMemo(() => {
    if (!current || !mode) return null;
    const correct = current;
    const othersCount = Math.min(numOptions - 1, pool.length - 1);
    if (mode === "nombre") {
      const others = pickRandom(
        pool.filter((m) => m.id !== correct.id),
        othersCount
      );
      const options = shuffle([correct.nombreComun, ...others.map((m) => m.nombreComun)]);
      return {
        type: "nombre" as const,
        image: correct.imagenes[Math.floor(Math.random() * correct.imagenes.length)],
        correct: correct.nombreComun,
        options,
      };
    }
    if (mode === "cientifico") {
      const others = pickRandom(
        pool.filter((m) => m.id !== correct.id),
        othersCount
      );
      const options = shuffle([
        correct.nombreCientifico,
        ...others.map((m) => m.nombreCientifico),
      ]);
      return {
        type: "cientifico" as const,
        image: correct.imagenes[Math.floor(Math.random() * correct.imagenes.length)],
        correct: correct.nombreCientifico,
        options,
      };
    }
    if (mode === "comestible") {
      const options = [...COMESTIBILIDAD_OPTIONS];
      return {
        type: "comestible" as const,
        image: correct.imagenes.length > 0
          ? correct.imagenes[Math.floor(Math.random() * correct.imagenes.length)]
          : null,
        name: correct.nombreComun,
        correct: correct.comestibilidad,
        options,
      };
    }
    return null;
  }, [current, mode, pool, numOptions]);

  const handleAnswer = useCallback(
    (value: string) => {
      if (revealed || !questionData) return;
      setSelected(value);
      setRevealed(true);
      if (value === questionData.correct) setScore((s) => s + 1);
    },
    [revealed, questionData]
  );

  const handleNext = useCallback(() => {
    setQuestionIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setRoundStarted(false);
    setMode(null);
    setQuestionIndex(0);
    setScore(0);
    setSelected(null);
    setRevealed(false);
  }, []);

  const startRound = useCallback((m: QuizMode) => {
    const storedLevel = getStoredLevel(m);
    setMode(m);
    setLevel(storedLevel);
    setRoundStarted(true);
    setQuestionIndex(0);
    setScore(0);
    setSelected(null);
    setRevealed(false);
  }, []);

  const formatHistoryDate = (dateIso: string) => {
    try {
      const d = new Date(dateIso);
      const now = new Date();
      const sameDay = d.toDateString() === now.toDateString();
      if (sameDay) return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    } catch (_) {
      return "";
    }
  };

  if (!roundStarted) {
    return (
      <div className="pageQuiz">
        <Link to="/" className="backLink">
          ← Volver al catálogo
        </Link>
        <h1 className="h1">Quiz de setas</h1>
        <p className="lead">
          Elige un modo y responde. Cada modo tiene nivel 1 → 2 → 3 (más preguntas y opciones). Si aciertas todas, se desbloquea el siguiente nivel.
        </p>
        <div className="quizModes">
          {(["nombre", "cientifico", "comestible"] as const).map((m) => {
            const currentLevel = getStoredLevel(m);
            const label = MODE_LABELS[m];
            const disabled = m === "comestible" ? mushrooms.length < 2 : !canStart;
            return (
              <button
                key={m}
                type="button"
                className="quizModeCard"
                onClick={() => startRound(m)}
                disabled={disabled}
              >
                <span className="quizModeEmoji" aria-hidden>
                  {m === "nombre" ? "🖼️" : m === "cientifico" ? "🔬" : "🍽️"}
                </span>
                <h2 className="h2">{label}</h2>
                <p className="small">
                  Nivel {currentLevel} · {QUESTIONS_BY_LEVEL[currentLevel]} preguntas
                  {(m === "nombre" || m === "cientifico") && ` · ${OPTIONS_BY_LEVEL[currentLevel]} opciones`}
                </p>
              </button>
            );
          })}
        </div>
        {!canStart && (
          <p className="small" style={{ marginTop: 16 }}>
            Añade fotos en <code>public/images/&lt;id&gt;/</code> para poder jugar a los modos con foto.
          </p>
        )}

        {history.length > 0 && (
          <section className="section quizHistorySection" aria-label="Historial del quiz">
            <h2 className="h2">Tu historial</h2>
            <p className="small">Últimos resultados (se guardan en este navegador):</p>
            <ul className="quizHistoryList">
              {history.slice(0, HISTORY_DISPLAY).map((entry, i) => (
                <li key={`${entry.date}-${i}`} className="quizHistoryItem">
                  <span className="quizHistoryMode">{MODE_LABELS[entry.mode]}</span>
                  <span className="quizHistoryLevel">N{entry.level}</span>
                  <span className="quizHistoryScore">{entry.score}/{entry.total}</span>
                  <span className="quizHistoryDate">{formatHistoryDate(entry.date)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="pageQuiz">
        <Link to="/" className="backLink">← Volver</Link>
        <p className="small">No hay suficientes setas con fotos para este modo.</p>
      </div>
    );
  }

  if (!questionData || !current) {
    return null;
  }

  const isCorrect = selected === questionData.correct;

  return (
    <div className="pageQuiz">
      <div className="quizHeader">
        <Link to="/" className="backLink quizBack">← Salir</Link>
        <span className="quizProgress">
          Pregunta {questionIndex + 1} / {questions.length} · Aciertos: {score} · Nivel {level}
        </span>
      </div>

      <div className="quizQuestion">
        {questionData.type === "comestible" && questionData.name && (
          <>
            <p className="quizQuestionLabel">¿Esta seta es comestible o no?</p>
            <p className="quizMushroomName">{questionData.name}</p>
          </>
        )}
        {(questionData.type === "nombre" || questionData.type === "cientifico") && (
          <p className="quizQuestionLabel">
            {questionData.type === "nombre" ? "¿Cómo se llama esta seta?" : "¿Cuál es su nombre científico?"}
          </p>
        )}

        {"image" in questionData && questionData.image && (
          <div className="quizImageWrap">
            <img
              src={questionData.image.src}
              alt={questionData.image.alt}
              className="quizImage"
            />
          </div>
        )}

        {questionData.type === "comestible" && !questionData.image && (
          <p className="small">(Esta seta no tiene foto en el catálogo)</p>
        )}

        <div className="quizOptions" role="listbox" aria-label="Opciones">
          {questionData.options.map((opt) => {
            const isSelectedOption = selected === opt;
            const isCorrectOption = opt === questionData.correct;
            const showRight = revealed && isCorrectOption;
            const showWrong = revealed && isSelectedOption && !isCorrectOption;
            return (
              <button
                key={opt}
                type="button"
                className={`quizOption ${showRight ? "quizOption--correct" : ""} ${showWrong ? "quizOption--wrong" : ""}`}
                onClick={() => handleAnswer(opt)}
                disabled={revealed}
                role="option"
                aria-selected={isSelectedOption}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="quizFeedback">
            <p className={isCorrect ? "quizFeedbackCorrect" : "quizFeedbackWrong"}>
              {isCorrect ? "✓ Correcto" : `✗ Correcto: ${questionData.correct}`}
            </p>
            {!isLastQuestion && (
              <button type="button" className="quizNext" onClick={handleNext}>
                Siguiente →
              </button>
            )}
          </div>
        )}
      </div>

      {revealed && isLastQuestion && (
        <div className="quizFinalScore">
          <p className="h2">Resultado: {score} / {questions.length} aciertos</p>
          {score === questions.length && level < 3 && (
            <p className="quizLevelUp">¡Nivel superado! La próxima vez este modo tendrá más preguntas (nivel {level + 1}).</p>
          )}
          {score === questions.length && level === 3 && (
            <p className="quizLevelUp">¡Nivel máximo! Perfecto.</p>
          )}
          <button type="button" className="quizRestart" onClick={handlePlayAgain}>
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
