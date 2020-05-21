import React from 'react';
import {mount} from "enzyme";
import {match, MemoryRouter} from "react-router";
import {DatasetHistory, DatasetHistoryRouteProps} from "../../../pages/Datasets/DatasetHistory";
import {createLocation, createMemoryHistory} from "history";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<DatasetHistoryRouteProps> = {
    params: {
        datasetId: "123"
    },
    path:"",
    isExact: true,
};

describe("<DatasetHistory />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><DatasetHistory match={matchMock} location={location} history={history}/></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(4);
    });
});
