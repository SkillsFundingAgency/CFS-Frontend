﻿import {useEffect, useRef} from 'react';
import {UnregisterCallback} from "history";
import {useHistory} from "react-router";
import * as React from "react";

export const useConfirmLeavePage = (preventDefault: boolean,
                                    message = 'Are you sure you want to leave without saving your changes?') => {
    const self = useRef<UnregisterCallback | null>();
    const history = useHistory();
    
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

    useEffect(() => {
        self.current = preventDefault ? history.block(message) : null;
        preventDefault = false;

        window.addEventListener('beforeunload', onWindowOrTabClose);

        return () => {
            if (self.current) {
                self.current();
                self.current = null;
            }

            window.removeEventListener('beforeunload', onWindowOrTabClose);
        };
    }, [message, preventDefault]);
    
    return {
        history,
        onWindowOrTabClose,
        preventDefault,
        self
    }
};