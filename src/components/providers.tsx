"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Answers } from "@/lib/types";
type AppState = {
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  comparison: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
};
const Context = createContext<AppState | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [comparison, setComparison] = useState<string[]>([]);
  function toggleCompare(id: string) {
    setComparison((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev,
    );
  }
  return (
    <Context.Provider
      value={{
        answers,
        setAnswers,
        step,
        setStep,
        comparison,
        toggleCompare,
        clearCompare: () => setComparison([]),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const state = useContext(Context);
  if (!state) throw new Error("App provider is missing");
  return state;
}
