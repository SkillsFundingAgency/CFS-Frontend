﻿import {useMemo, useRef} from 'react';
import {UnregisterCallback} from "history";
import {useHistory} from "react-router";

export const useConfirmLeavePage = (preventDefault: boolean,
                                    message: string = 'Are you sure you want to leave without saving your changes?') => {
    const self = useRef<UnregisterCallback | null>();
    let history = useHistory();
    
    const onWindowOrTabClose = (event: BeforeUnloadEvent) => {
        if (!preventDefault) {
            return;
        }

        if (typeof event === 'undefined') {
            event = window.event as BeforeUnloadEvent;
        }

        if (event) {
            event.returnValue = message;
        }

        return message;
    };

    useMemo(() => {
        self.current = preventDefault ? history.block(message) : null;

        window.addEventListener('beforeunload', onWindowOrTabClose);

        return () => {
            if (self.current) {
                self.current();
                self.current = null;
            }

            window.removeEventListener('beforeunload', onWindowOrTabClose);
        };
    }, [message, preventDefault, history, onWindowOrTabClose]);
    
    return {
        history,
        onWindowOrTabClose,
        preventDefault,
        self
    }
};