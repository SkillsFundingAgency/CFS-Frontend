
ko.bindingHandlers.monacoEditor = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here

        let valueUnwrapped = ko.unwrap(valueAccessor());

        require.config({ paths: { 'vs': '/assets/libs/js/monaco/vs' } });
        require(['vs/editor/editor.main'], function () {
            let editor = monaco.editor.create(element, {
                value: valueUnwrapped,
                language: 'vb',
                minimap: { enabled: false }
            });

            
            // When content editor is updated, then update knockout observable
            editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
                let value = valueAccessor();
                value(editor.getValue());
            });

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