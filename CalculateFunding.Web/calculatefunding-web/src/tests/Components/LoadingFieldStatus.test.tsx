import React from 'react';
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

describe('<LoadingFieldStatus />', () => {

    it(' renders a loading status', () => {
        const wrapper = shallow(<LoadingFieldStatus id={"testLoading"} title={"test title"} />);

        let actual = wrapper.find("#testLoading");

        expect(actual.children().length).toBe(1);
    });

    it(' has the correct description', () => {
        const wrapper = shallow(<LoadingFieldStatus title={"test title"} hidden={false} />);

        let actual = wrapper.find('div.loader-text');

        expect(actual.text() === "test title").toBeTruthy();
    });

    it(' hides component given hidden property is set to true', () => {
        const wrapper = shallow(<LoadingFieldStatus id={"testLoading"} title={"test title"}  hidden={true} />);

        let actual = wrapper.find("#testLoading>div");

        expect(actual.props().hidden).toBeTruthy();
    });
});