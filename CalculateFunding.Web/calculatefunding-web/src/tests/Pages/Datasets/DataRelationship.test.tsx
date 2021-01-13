import React from 'react';
import {mount} from "enzyme";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {DataRelationships, DataRelationshipsRouteProps} from "../../../pages/Datasets/DataRelationships";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<DataRelationshipsRouteProps> = {
    params: {
        specificationId: "123"
    },
    path: "",
    url: "",
    isExact: true,
};

describe("<DataRelationships />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><DataRelationships match={matchMock} location={location} history={history}/></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(4);
    });

    it('will have the create button text', () => {
        const wrapper = mount(<MemoryRouter><DataRelationships match={matchMock} location={location} history={history}/></MemoryRouter>);
        expect(wrapper.find("Link#create-dataset-link").text()).toBe("Add new dataset");
    });

    it('will have the first table header', () => {
        const wrapper = mount(<MemoryRouter><DataRelationships match={matchMock} location={location} history={history}/></MemoryRouter>);
        expect(wrapper.find("table#datarelationship-table>thead>tr").childAt(0).text()).toBe("Dataset");
    });

    it('will have the second table header', () => {
        const wrapper = mount(<MemoryRouter><DataRelationships match={matchMock} location={location} history={history}/></MemoryRouter>);
        expect(wrapper.find("table#datarelationship-table>thead>tr").childAt(1).text()).toBe("Mapped data source file");
    });
});
