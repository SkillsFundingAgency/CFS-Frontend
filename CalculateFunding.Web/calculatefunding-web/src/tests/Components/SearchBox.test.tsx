import {SearchBox} from "../../components/SearchBox";
import React from "react";
import {mount} from "enzyme";

describe("<SearchBox />", () => {
    it("renders correctly", () => {
        const mockCallback = jest.fn();
        const component = mount(<SearchBox callback={mockCallback} timeout={0}/>);
        expect(component.render()).toBeTruthy();
    });
});