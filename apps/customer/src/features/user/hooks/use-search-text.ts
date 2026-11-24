import { useEffect, useRef, useState } from "react";

// Wait for a pause in typing so each keystroke isn't a search (as the web's search overlay).
const DEBOUNCE_MS = 300;

/**
 * The search box's text for a page whose search lives in the route's `q` param. Typing shows at once; the param
 * changes after a pause. A new `q` from outside (Home's search) replaces the text.
 */
export function useSearchText(q: string, commit: (text: string) => void): [string, (text: string) => void] {
  const [text, setText] = useState(q);
  const sent = useRef(q);
  const latestCommit = useRef(commit);
  useEffect(() => {
    latestCommit.current = commit;
  });

  useEffect(() => {
    if (q === sent.current) return;
    sent.current = q;
    setText(q);
  }, [q]);

  useEffect(() => {
    if (text === sent.current) return;
    const timer = setTimeout(() => {
      sent.current = text;
      latestCommit.current(text);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  return [text, setText];
}
