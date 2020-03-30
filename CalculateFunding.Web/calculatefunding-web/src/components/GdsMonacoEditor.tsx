import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/language/css/monaco.contribution'
import 'monaco-editor/esm/vs/language/html/monaco.contribution'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution'
import {createElement as create, useRef, useEffect} from 'react'
import {useEffectOnce} from "../hooks/useEffectOnce";

export function GdsMonacoEditor(props: {
    value: string,
    change: any,
    language: string,
    minimap: boolean,
    specificationId:string
}) {
    const height: number = 291;
    const element = useRef<HTMLElement>();
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

    useEffect(() => {
        const resize = () => {
            if (editor.current) {
                editor.current.layout({height: 0, width: 0});
                editor.current.layout()
            }
        };
        window.addEventListener('resize', resize);
        setTimeout(() => resize);
        return () => window.removeEventListener('resize', resize)
    });

    useEffectOnce(() => {
        if (element.current) {
            editor.current = monaco.editor.create(element.current, {
                value: props.value,
                language: props.language,
                theme: 'vs-light',
                minimap: {
                    enabled: props.minimap,
                },
            });
            editor.current.onDidChangeModelContent(() => {
                if (editor.current && props.change) props.change(editor.current.getValue())
            })
        }
        return () => editor.current && editor.current.dispose()
    });

    useEffect(() => {
        if (editor.current && editor.current.getValue() !== props.value) {
            editor.current.setValue(props.value)
        }
    }, [props.value]);

    return create('div', {
        className: "govuk-textarea--monaco-editor",
        children: create('div', {
            ref: element,
            style: {height: height},
        }),
    })
}
