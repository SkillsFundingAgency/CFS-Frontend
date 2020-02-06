import React from 'react';
import Pagination from "../../components/Pagination";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;

describe('<Pagination />', () => {
    it('shows the list', () => {
        const wrapper = shallow(<Pagination callback={() => {
        }} currentPage={1} lastPage={1}/>);

        let actual = wrapper.find('ul');

        expect(actual).toBeTruthy();
    });

    it('next page button is enabled', () => {
        const wrapper = shallow(<Pagination callback={() => {
        }} currentPage={1} lastPage={1}/>);

        let actual = wrapper.find('ul').find('li');

        expect(actual.hasOwnProperty("disabled")).toBeFalsy();
    });

    it('contains a list for buttons', () => {
        const wrapper = shallow(<Pagination callback={() => {
        }} currentPage={1} lastPage={10}/>);

        let actual = wrapper.find('ul');

        expect(actual.children()).toHaveLength(4);
    });
});