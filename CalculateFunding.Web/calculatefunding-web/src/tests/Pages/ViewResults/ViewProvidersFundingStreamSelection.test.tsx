import React from 'react';
import {mount} from "enzyme";
import {MemoryRouter} from "react-router";
import {ViewProvidersFundingStreamSelection} from "../../../pages/ViewResults/ViewProvidersFundingStreamSelection";

describe("<ViewProvidersFundingStreamSelection />", () => {
    it('will render the page', () => {
        const wrapper = mount(<MemoryRouter><ViewProvidersFundingStreamSelection/></MemoryRouter>);

        expect(wrapper.find('#funding-stream-selection')).toBeTruthy();
    });

    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><ViewProvidersFundingStreamSelection/></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(3);
    });
});