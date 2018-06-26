declare module monaco.editor{
    export interface IEditor {
        updateOptions(options: IDiffEditorOptions | monaco.editor.IEditorOptions) : void;
    }
}