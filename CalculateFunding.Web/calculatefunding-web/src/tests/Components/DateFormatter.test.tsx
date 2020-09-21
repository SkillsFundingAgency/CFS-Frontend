import React from 'react';
import {DateFormatter} from "../../components/DateFormatter";
import {shallow} from "enzyme";

describe('<DateFormatter />', () => {
    it(' renders a panel', () => {
        const wrapper = shallow(<DateFormatter date={new Date(2000, 0, 1, 0, 0)} utc={true} />);

        let actual = wrapper.find('span');

        expect(actual.length).toBe(1);
    });

    it(' has the correct date and time for a utc clock', () => {
        const wrapper = shallow(<DateFormatter date={new Date(2000, 0, 1, 0, 0)} utc={true} />);

        let actual = wrapper.find('span');

        expect(actual.text()).toBe("1 January 2000 00:00");
    });

    it(' has the correct date and time for a 12 hour clock', () => {
        const wrapper = shallow(<DateFormatter date={new Date(2000, 0, 1, 1, 0)} utc={false} />);

        let actual = wrapper.find('span');

        expect(actual.text()).toBe("1 January 2000 1:00 am");
    });

    it(' has the correct date and midnight time for a 12 hour clock', () => {
        const wrapper = shallow(<DateFormatter date={new Date(2000, 0, 1, 0, 0)} utc={false} />);

        let actual = wrapper.find('span');

        expect(actual.text()).toBe("1 January 2000 0:00 am");
    });

    it(' excludes time when utc is undefined', () => {
        const wrapper = shallow(<DateFormatter date={new Date(2000, 0, 1, 0, 0)} />);

        let actual = wrapper.find('span');

        expect(actual.text()).toBe("1 January 2000");
    });
});