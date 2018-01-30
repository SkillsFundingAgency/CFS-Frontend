
ko.bindingHandlers.monacoDiff = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here

        let valueUnwrapped = ko.unwrap(valueAccessor());

        if (typeof valueUnwrapped.original === "undefined") {
            throw new Error("Original code not defined in binding");
        }

        if (typeof valueUnwrapped.original === "undefined") {
            throw new Error("Original code not defined in binding");
        }

        let originalText: string = ko.unwrap(valueUnwrapped.original);

        if (typeof valueUnwrapped.modified === "undefined") {
            throw new Error("Modified code not defined in binding");
        }

        let modifiedText: string = ko.unwrap(valueUnwrapped.modified);

        let displayAsInline: boolean = false;
        if (typeof valueUnwrapped.displayAsInline !== "undefined") {
            let displayAsInlineValue = ko.unwrap(valueUnwrapped.displayAsInline);
            if (displayAsInlineValue) {
                displayAsInline = true;
            }
        }

        require.config({ paths: { 'vs': '/assets/libs/js/monaco/vs' } });
        require(['vs/editor/editor.main'], function () {
            let editor = monaco.editor.createDiffEditor(element, {
                minimap: { enabled: false },

                // You can optionally disable the resizing
                enableSplitViewResizing: !displayAsInline,

                // Render the diff inline
                renderSideBySide: !displayAsInline,

                scrollBeyondLastLine: false,
            });

            var originalModel = monaco.editor.createModel(originalText, "text/plain");
            var modifiedModel = monaco.editor.createModel(modifiedText, "text/plain");

            editor.setModel({
                original: originalModel,
                modified: modifiedModel,
            });

            // Save the editor variable for access when update is called
            ko.utils.domData.set(element, "editor", editor);
        });


    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.

        let unwrapped = ko.unwrap(valueAccessor());

        let editor: monaco.editor.IStandaloneCodeEditor = ko.utils.domData.get(element, "editor");
        let valueUnwrapped = ko.unwrap(valueAccessor());
        let displayAsInline: boolean = false;
        if (typeof valueUnwrapped.displayAsInline !== "undefined") {
            let displayAsInlineValue = ko.unwrap(valueUnwrapped.displayAsInline);
            if (displayAsInlineValue) {
                displayAsInline = true;
            }
        }

        if (editor) {
            editor.updateOptions({
                // You can optionally disable the resizing
                enableSplitViewResizing: !displayAsInline,

                // Render the diff inline
                renderSideBySide: !displayAsInline
            });
        }
    }
};