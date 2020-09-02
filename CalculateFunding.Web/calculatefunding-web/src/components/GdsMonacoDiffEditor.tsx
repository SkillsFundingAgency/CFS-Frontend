import React, {useEffect, useRef} from "react";
import * as monaco from "monaco-editor";
import {editor} from "monaco-editor";

export function GdsMonacoDiffEditor(props: {
    firstCalculationVersion: string,
    secondCalculationVersion: string,
    inlineCodeViewer: boolean
}) {
    const height: number = 291;
    const element = useRef<HTMLElement>();
    const editor = useRef<monaco.editor.IStandaloneDiffEditor>();
    let isInline = props.inlineCodeViewer;

    useEffect(() => {
        if (element.current) {
            let model: editor.IDiffEditorModel = {
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
    }, [isInline]);

    const removeActionBarOverlay = () => {
        var didUpdateDiffDisposable = editor.current.onDidUpdateDiff(() => {
            didUpdateDiffDisposable.dispose();
            setTimeout(() => {
                const closeActionButton = document.getElementsByClassName("close-diff-review")[0];
                closeActionButton && closeActionButton.click();
            }, 500);
        });
    }

    useEffect(() => {
        if (editor.current && (editor.current.getOriginalEditor().getValue() !== props.firstCalculationVersion || editor.current.getModifiedEditor().getValue() !== props.secondCalculationVersion)) {
            let model: editor.IDiffEditorModel = {
                original: monaco.editor.createModel(props.firstCalculationVersion, "text/plain"),
                modified: monaco.editor.createModel(props.secondCalculationVersion, "text/plain")
            }
            editor.current.setModel(model);
        }
    }, [props.firstCalculationVersion, props.secondCalculationVersion]);

    return (
        <div className="govuk-textarea--monaco-editor">
            <div ref={element}></div>
        </div>
    );
}