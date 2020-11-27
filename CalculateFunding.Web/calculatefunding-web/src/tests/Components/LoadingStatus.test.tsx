import React from 'react';
import {LoadingStatus} from "../../components/LoadingStatus";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

describe('<LoadingStatus />', () => {

    it(' renders a loading status', () => {
        const wrapper = shallow(<LoadingStatus id={"testLoading"} title={"test title"} />);

        const actual = wrapper.find("#testLoading");

        expect(actual.children().length).toBe(1);
    });

    it(' has the correct title', () => {
        const wrapper = shallow(<LoadingStatus title={"test title"} />);

        const actual = wrapper.find('h2.govuk-heading-l');

        expect(actual.text() === "test title").toBeTruthy();
    });

    it(' has the correct sub title', () => {
        const wrapper = shallow(<LoadingStatus title={"test title"} subTitle={"test sub title"} />);

        const actual = wrapper.find('h3.govuk-heading-m');

        expect(actual.text() === "test sub title").toBeTruthy();
    });

    it(' has the correct description', () => {
        const wrapper = shallow(<LoadingStatus title={"test title"}  description={"test description"} />);

        const actual = wrapper.find('p');

        expect(actual.text() === "test description").toBeTruthy();
    });

    it(' hides component given hidden property is set to true', () => {
        const wrapper = shallow(<LoadingStatus id={"testLoading"} title={"test title"}  hidden={true} />);

        const actual = wrapper.find("#testLoading");

        expect(actual.props().hidden).toBeTruthy();
    });
});