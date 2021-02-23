import React from 'react';
import {render, screen} from "@testing-library/react";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";

const renderDateTimeFormatter = (date:Date) => {
    return render(<DateTimeFormatter date={date} />)
}

describe('<DateTimeFormatter />', () => {
    it(' renders a panel', async () => {
        renderDateTimeFormatter(new Date(2000, 0, 1, 0, 0));
        expect(screen.getByTestId(/datetime-formatter/)).toBeDefined();
    });

    it(' has the correct date and time', () => {
        renderDateTimeFormatter(new Date(Date.UTC(2020, 2, 11, 12, 46)));
        expect(screen.getByText(/11 March 2020 12:46/));
    });

    it('can parse a JSON date time and accept it', () => {
        const date :Date = new Date("2000-01-01T01:00:00.00+00:00");
        renderDateTimeFormatter(date);
        expect(screen.getByText(/1 January 2000 01:00/));
    })

    it('has only the date time in the span', ()=>{
        renderDateTimeFormatter(new Date(Date.UTC(1995, 10, 29, 13, 32)));
        expect(screen.getByTestId(/datetime-formatter/).textContent).toBe('29 November 1995 13:32');
    });
});