import React from 'react';
import {Header} from "../../components/Header";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;


it('shows the Beta panel', () => {
    const wrapper = shallow(<Header />);

    let actual = wrapper.find('strong.govuk-phase-banner__content__tag');

    expect(actual).toBeTruthy();
});

it('shows Calculate funding in the service name', ()=>{
   const wrapper = shallow(<Header/>);

   let actual = wrapper.find('govuk-header__link--service-name');

   expect(actual.contains("Calculate funding"));
});

it('shows GOV.UK in the logotype text area', ()=>{
   const wrapper = shallow(<Header/>);

   let actual = wrapper.find('govuk-header__logotype-text');

   expect(actual.contains("GOV.UK"));
});