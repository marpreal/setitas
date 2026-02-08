import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { COMESTIBILIDAD_OPTIONS, getMushrooms } from "../data/mushrooms";

type QuizMode = "nombre" | "cientifico" | "comestible";

const QUESTIONS_PER_ROUND = 5;

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

export default function Quiz() {
  const mushrooms = useMemo(() => getMushrooms(), []);
  const withImages = useMemo(
    () => mushrooms.filter((m) => m.imagenes.length > 0),
    [mushrooms]
  );

  const [mode, setMode] = useState<QuizMode | null>(null);
  const [roundStarted, setRoundStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const pool = mode === "comestible" ? mushrooms : withImages;
  const canStart = pool.length >= 4;

  const questions = useMemo(() => {
    if (!mode || pool.length < 2) return [];
    const count = Math.min(QUESTIONS_PER_ROUND, pool.length);
    return shuffle(pool).slice(0, count);
  }, [mode, pool]);

  const current = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;

  const questionData = useMemo(() => {
    if (!current || !mode) return null;
    const correct = current;
    if (mode === "nombre") {
      const others = pickRandom(
        pool.filter((m) => m.id !== correct.id),
        Math.min(3, pool.length - 1)
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
        Math.min(3, pool.length - 1)
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
  }, [current, mode, pool]);

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
    setMode(m);
    setRoundStarted(true);
    setQuestionIndex(0);
    setScore(0);
    setSelected(null);
    setRevealed(false);
  }, []);

  if (!roundStarted) {
    return (
      <div className="pageQuiz">
        <Link to="/" className="backLink">
          ← Volver al catálogo
        </Link>
        <h1 className="h1">Quiz de setas</h1>
        <p className="lead">
          Elige un modo y responde {QUESTIONS_PER_ROUND} preguntas. Solo se usan setas que tienen fotos (salvo en «¿Es comestible?»).
        </p>
        <div className="quizModes">
          <button
            type="button"
            className="quizModeCard"
            onClick={() => startRound("nombre")}
            disabled={!canStart}
          >
            <span className="quizModeEmoji" aria-hidden>🖼️</span>
            <h2 className="h2">¿Cómo se llama?</h2>
            <p className="small">Ves una foto y eliges el nombre común correcto.</p>
          </button>
          <button
            type="button"
            className="quizModeCard"
            onClick={() => startRound("cientifico")}
            disabled={!canStart}
          >
            <span className="quizModeEmoji" aria-hidden>🔬</span>
            <h2 className="h2">¿Nombre científico?</h2>
            <p className="small">Ves una foto y eliges el nombre científico correcto.</p>
          </button>
          <button
            type="button"
            className="quizModeCard"
            onClick={() => startRound("comestible")}
            disabled={mushrooms.length < 2}
          >
            <span className="quizModeEmoji" aria-hidden>🍽️</span>
            <h2 className="h2">¿Es comestible?</h2>
            <p className="small">Ves nombre y foto y eliges si es comestible, tóxica, etc.</p>
          </button>
        </div>
        {!canStart && (
          <p className="small" style={{ marginTop: 16 }}>
            Añade fotos en <code>public/images/&lt;id&gt;/</code> para poder jugar a los modos con foto.
          </p>
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
          Pregunta {questionIndex + 1} / {questions.length} · Aciertos: {score}
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
          <button type="button" className="quizRestart" onClick={handlePlayAgain}>
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
