import { useCallback, useState } from "react";

export const useToggle = () => {

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const toggleExpanded = useCallback((e?: React.MouseEvent<HTMLElement, MouseEvent> | undefined): void => {
    e?.preventDefault();
    setIsExpanded(state => !state);
  }, []);

  return { isExpanded, toggleExpanded, setExpanded: setIsExpanded };
}
