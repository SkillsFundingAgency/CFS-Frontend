import {CompliationErrorMessageList} from "../../../components/Calculations/CompliationErrorMessageList";
import {mount} from "enzyme";
import {CompilerMessage} from "../../../types/Calculations/PreviewResponse";
import React from "react";

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
    severity:"Test severity 1"
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
    severity:"Test severity 2"
}];
const errorMessage = "Error message";

describe('<CompliationErrorMessageList /> renders ', () => {
    it('the title', () => {
   const wrapper = mount(<CompliationErrorMessageList compilerMessages={compilerMessages} errorMessage={errorMessage} />);
        expect(wrapper.find('h2').text()).toBe("There was a compilation error")
    });

    it('a table of two rows for the compiler messages', () => {
        const wrapper = mount(<CompliationErrorMessageList compilerMessages={compilerMessages} errorMessage={errorMessage} />);
        expect(wrapper.find('table>tr').length).toBe(2);
    });
});