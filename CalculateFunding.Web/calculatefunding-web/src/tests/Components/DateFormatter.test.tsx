import React from 'react';
import {DateFormatter} from "../../components/DateFormatter";
import {render, screen} from "@testing-library/react";

const renderDateFormatter = (date:Date, isUtc?:boolean) => {
    return render(<DateFormatter date={date} utc={isUtc} />)
}

describe('<DateFormatter />', () => {
    it(' renders a panel', async () => {
        renderDateFormatter(new Date(2000, 0, 1, 0, 0), true);
        expect(screen.getByTestId(/date-formatter/)).toBeDefined();
    });

    it(' has the correct date', () => {
        renderDateFormatter(new Date(2000, 0, 1, 1, 0), true);
        expect(screen.getByText(/1 January 2000/));
    });

    it('can parse a JSON date and accept it', () => {
        const date :Date = new Date("2000-01-01T01:00:00.00+00:00");
        renderDateFormatter(date, true);
        expect(screen.getByText(/1 January 2000/));
    })
});