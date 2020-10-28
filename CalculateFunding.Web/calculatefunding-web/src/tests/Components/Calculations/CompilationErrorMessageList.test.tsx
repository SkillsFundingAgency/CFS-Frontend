import React from "react";
import {CompilationErrorMessageList} from "../../../components/Calculations/CompilationErrorMessageList";
import {mount} from "enzyme";
import {CompileErrorSeverity, CompilerMessage} from "../../../types/Calculations/CalculationCompilePreviewResponse";

const compilerMessages : CompilerMessage[] = [{
    location: {
        endChar:2,
        endLine:1,
        owner: {
            id: "Test Owner Id 1",
            name: "Test Owner Name 1"
        },
        startChar:1,
        startLine:1,
    },
    message:"Test message 1",
    severity: CompileErrorSeverity.Error
},{
    location: {
        endChar:2,
        endLine:1,
        owner: {
            id: "Test Owner Id 2",
            name: "Test Owner Name 2"
        },
        startChar:1,
        startLine:1,
    },
    message:"Test message 2",
    severity: CompileErrorSeverity.Error
}];
const errorMessage = "Error message";

describe('<CompliationErrorMessageList /> renders ', () => {
    it('the title', () => {
   const wrapper = mount(<CompilationErrorMessageList compilerMessages={compilerMessages} />);
        expect(wrapper.find('h2').text()).toBe("There was a compilation error")
    });

    it('a table of two rows for the compiler messages', () => {
        const wrapper = mount(<CompilationErrorMessageList compilerMessages={compilerMessages} />);
        expect(wrapper.find('table>tbody>tr').length).toBe(2);
    });
});