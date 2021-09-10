import { useEffect, useRef } from "react";

export const useEventListener = (
  eventName: string,
  handler: React.KeyboardEventHandler,
  element = window
) => {
  const savedHandler = useRef<React.KeyboardEventHandler>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event: React.KeyboardEvent) => {
      if (savedHandler && savedHandler.current) {
        return savedHandler.current(event);
      }
    };

    element.addEventListener(eventName, eventListener as unknown as EventListener);

    return () => {
      element.removeEventListener(eventName, eventListener as unknown as EventListener);
    };
  }, [eventName, element]);
};
