"use client";

import { useEffect, useRef, useState } from "react";

const PROMPT_EXAMPLES = [
  "A friendly dinosaur celebrating a birthday...",
  "A curious fox reading beneath a big oak tree...",
  "A cheerful space adventure with planets and stars...",
] as const;

export function HomepagePromptInput() {
  const [value, setValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const hasEdited = useRef(false);

  useEffect(() => {
    if (isEditing) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setValue(PROMPT_EXAMPLES[0]);
      return;
    }

    let exampleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNext = () => {
      const example = PROMPT_EXAMPLES[exampleIndex];

      if (!deleting) {
        characterIndex += 1;
        setValue(example.slice(0, characterIndex));

        if (characterIndex === example.length) {
          deleting = true;
          timeoutId = setTimeout(typeNext, 1650);
          return;
        }

        timeoutId = setTimeout(typeNext, 42);
        return;
      }

      characterIndex -= 1;
      setValue(example.slice(0, characterIndex));

      if (characterIndex === 0) {
        deleting = false;
        exampleIndex = (exampleIndex + 1) % PROMPT_EXAMPLES.length;
        timeoutId = setTimeout(typeNext, 320);
        return;
      }

      timeoutId = setTimeout(typeNext, 22);
    };

    timeoutId = setTimeout(typeNext, 260);
    return () => clearTimeout(timeoutId);
  }, [isEditing]);

  return (
    <input
      id="homepage-idea"
      name="prompt"
      type="text"
      maxLength={500}
      value={value}
      onFocus={(event) => {
        setIsEditing(true);
        if (!hasEdited.current) event.currentTarget.select();
      }}
      onChange={(event) => {
        hasEdited.current = true;
        setIsEditing(true);
        setValue(event.target.value);
      }}
      aria-label="Describe your coloring page idea"
    />
  );
}
