import React from 'react';
import {mount} from "enzyme";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {SelectDataSourceRouteProps} from "../../../pages/Datasets/SelectDataSource";
import {SelectDataSourceExpanded} from "../../../pages/Datasets/SelectDataSourceExpanded";

// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<SelectDataSourceRouteProps> = {
    params: {
        datasetRelationshipId: "123"
    },
    path: "",
    isExact: true,
};
jest.mock("../../../components/AdminNav");

describe("<SelectDataSourceExpanded />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><SelectDataSourceExpanded match={matchMock} location={location} history={history}/></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(5);
    });

    it('will have the correct sub-title', () => {
        const wrapper = mount(<MemoryRouter><SelectDataSourceExpanded match={matchMock} location={location} history={history}/></MemoryRouter>);
        expect(wrapper.find("h4.govuk-heading-s").at(0).text()).toBe("Select data source version");
    });
});
