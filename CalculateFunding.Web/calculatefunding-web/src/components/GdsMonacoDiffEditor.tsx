import React, {RefObject, useEffect, useRef} from "react";
import * as monaco from "monaco-editor";
import {editor} from "monaco-editor";

export function GdsMonacoDiffEditor(props: {
    firstCalculationVersion: string,
    secondCalculationVersion: string,
    inlineCodeViewer: boolean
}) {
    const element = useRef<HTMLDivElement>();
    const editor = useRef<monaco.editor.IStandaloneDiffEditor>();
    const isInline = props.inlineCodeViewer;

    useEffect(() => {
        if (element.current) {
            const model: editor.IDiffEditorModel = {
                original: monaco.editor.createModel(props.firstCalculationVersion, "text/plain"),
                modified: monaco.editor.createModel(props.secondCalculationVersion, "text/plain")
            }
            editor.current = monaco.editor.createDiffEditor(element.current, {
                enableSplitViewResizing: false,
                renderSideBySide: !props.inlineCodeViewer,
                minimap: {
                    enabled: false
                }
            });
            editor.current.setModel(model);

            removeActionBarOverlay();
        }
        return () => editor.current && editor.current.dispose();
    });

    const removeActionBarOverlay = () => {
        const didUpdateDiffDisposable = editor?.current?.onDidUpdateDiff(() => {
            didUpdateDiffDisposable?.dispose();
        });
    }

    useEffect(() => {
        if (editor.current && (editor.current.getOriginalEditor().getValue() !== props.firstCalculationVersion || editor.current.getModifiedEditor().getValue() !== props.secondCalculationVersion)) {
            const model: editor.IDiffEditorModel = {
                original: monaco.editor.createModel(props.firstCalculationVersion, "text/plain"),
                modified: monaco.editor.createModel(props.secondCalculationVersion, "text/plain")
            }
            editor.current.setModel(model);
        }
    }, [props.firstCalculationVersion, props.secondCalculationVersion]);

    return (
        <div className="govuk-textarea--monaco-editor">
            <div ref={element as RefObject<HTMLDivElement>}></div>
        </div>
    );
}