ko.bindingHandlers.monacoEditor = {
    init: function (element, valueAccessor, allBindings: KnockoutAllBindingsAccessor, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here

        let valueUnwrapped = ko.unwrap(valueAccessor());

        require.config({ paths: { 'vs': '/assets/libs/js/monaco/vs' } });
        require(['vs/editor/editor.main'], function () {

            let monacoEditorOptions = allBindings.get("monacoEditorOptions");
            let language: string = "vb";
            let theme: string = "";
            let autoIndent: boolean = false;
            
            if (monacoEditorOptions) {
                if (typeof (monacoEditorOptions.editorCreatingCallback) !== "undefined") {
                    if ($.isFunction(monacoEditorOptions.editorCreatingCallback)) {
                        monacoEditorOptions.editorCreatingCallback();
                    }
                }

                if (monacoEditorOptions["language"]) {
                    language = ko.unwrap(monacoEditorOptions["language"]);
                    console.log("Setting language to ", language);
                }

                if (monacoEditorOptions["theme"]) {
                    theme = ko.unwrap(monacoEditorOptions["language"]);
                    console.log("Setting theme to ", theme);
                }

                if (monacoEditorOptions["autoIndent"] !== undefined) {
                    autoIndent = ko.unwrap(monacoEditorOptions["autoIndent"]);
                }
            }

            let editor: monaco.editor.IStandaloneCodeEditor = monaco.editor.create(element, {
                value: valueUnwrapped,
                language: language,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                parameterHints: true,
                theme: theme,
                autoIndent: autoIndent,
            });


            // When content editor is updated, then update knockout observable
            editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
                let value = valueAccessor();
                value(editor.getValue());
            });

            if (monacoEditorOptions) {
                if (typeof (monacoEditorOptions.editorCreatedCallback) !== "undefined") {
                    if ($.isFunction(monacoEditorOptions.editorCreatedCallback)) {
                        monacoEditorOptions.editorCreatedCallback(editor);
                    }
                }
            }

            ko.utils.domData.set(element, "editor", editor);
        });


    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.

        let unwrapped = ko.unwrap(valueAccessor());

        let editor: monaco.editor.IStandaloneCodeEditor = ko.utils.domData.get(element, "editor");
        if (editor) {
            editor.setValue(unwrapped);
        }

    }
};