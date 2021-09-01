import React from 'react';
import {fireEvent, getByText, render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import SortableButton from "../../components/SortableButton";

const callbackFunction = jest.fn();

describe('<SortableButton />', () => {
    afterEach(() => {
        callbackFunction.mockClear();
    });

    it('renders a button', () => {
        render(<SortableButton callback={callbackFunction} sortName={'name'} title={"First name"} />);
        expect(screen.getByText("First name"));
    });

    it('changes aria-sortable on click', () => {
        const {container} = render(<SortableButton callback={callbackFunction} sortName={'name'} title={"First name"} />);

        fireEvent(getByText(container, 'First name'),
            new MouseEvent('click', {
                bubbles: true,
                cancelable: false
            }));

        waitFor(() => expect(screen.getByText('First name').parentElement).toHaveAttribute('aria-sortable', 'ascending'));
    });

    it('triggers a callback on click', () => {
        const {container} = render(<SortableButton callback={callbackFunction} sortName={'name'} title={"First name"} />);

        fireEvent(getByText(container, 'First name'),
            new MouseEvent('click', {
                bubbles: true,
                cancelable: false
            }));

        expect(callbackFunction).toHaveBeenCalledTimes(1);
    });
});
