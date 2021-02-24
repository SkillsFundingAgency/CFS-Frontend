import React from 'react';
import {render, screen,} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {CollapsibleSearchBox} from "../../../components/CollapsibleSearchBox";

const renderComponent = (searchTerm = "") => {
    const callback: (searchField: string, searchTerm: string) => void = jest.fn();
    return {...render(<CollapsibleSearchBox searchTerm={searchTerm} callback={callback}/>), callback};
};

describe('<CollapsibleSearchBox />', () => {

    beforeAll(() => jest.clearAllMocks());

    describe('with the provider name search', () => {

        test('renders the provider name search option', () => {
            renderComponent();
            const radioButton = screen.getByRole('radio', {name: /Provider name/i}) as HTMLInputElement;

            expect(radioButton).toBeTruthy();
        });

        test('the provider name search option is checked by default', () => {
            renderComponent();
            const radioButton = screen.getByRole('radio', {name: /Provider name/i}) as HTMLInputElement;

            expect(radioButton.checked).toBeTruthy();
        });

        test('renders the provider name search text box', () => {
            renderComponent();
            const textbox = screen.getByTestId('providerName') as HTMLInputElement;

            expect(textbox).toBeTruthy();
        });

        describe('when a provider name search text is entered', () => {
            test('raises correct callback when entering search text', async () => {
                const {callback} = renderComponent();
                const radioButton = screen.getByRole('radio', {name: /Provider name/i}) as HTMLInputElement;
                await userEvent.click(radioButton);
                const textbox = screen.getByTestId('providerName') as HTMLInputElement;

                await userEvent.type(textbox, "Hogwarts");

                expect(callback).toBeCalled();
                expect(callback).toBeCalledWith("providerName", "Hogwarts");
            });
        });
    });

    describe('with the UKPRN radio button', () => {

        test('renders the UKPRN radio button', () => {
            renderComponent();

            const radioButton = screen.getByRole('radio', {name: /UKPRN/i});

            expect(radioButton).toBeTruthy();
        });

        test('hides the UKPRN text box by default', () => {
            renderComponent();

            const textbox = screen.queryByTestId('ukprn') as HTMLInputElement;

            expect(textbox).not.toBeInTheDocument();
        });

        describe('when clicking on the UKPRN radio button', () => {

            test('enables UKPRN option', async () => {
                renderComponent();
                const radioButton = screen.getByRole('radio', {name: /UKPRN/i}) as HTMLInputElement;

                await userEvent.click(radioButton);

                expect(radioButton).toBeTruthy();
                expect(radioButton.checked).toBeTruthy();
            });

            test('renders the UKPRN text box', async () => {
                renderComponent();
                const radioButton = screen.getByRole('radio', {name: /UKPRN/i}) as HTMLInputElement;
                await userEvent.click(radioButton);

                const textbox = screen.getByTestId('ukprn') as HTMLInputElement;

                expect(textbox).toBeTruthy();
            });

            test('raises correct callback when entering UKPRN', async () => {
                const {callback} = renderComponent();
                const radioButton = screen.getByRole('radio', {name: /UKPRN/i}) as HTMLInputElement;
                await userEvent.click(radioButton);
                const textbox = screen.getByTestId('ukprn') as HTMLInputElement;

                await userEvent.type(textbox, "10101");

                expect(callback).toBeCalled();
                expect(callback).toBeCalledWith("ukprn", "101");
            });
        });
    });

    describe('with the UPIN radio button', () => {

        test('renders the UPIN radio button', () => {
            renderComponent();

            const radioButton = screen.getByRole('radio', {name: /UPIN/i});

            expect(radioButton).toBeTruthy();
        });

        test('hides the UPIN text box by default', () => {
            renderComponent();

            const textbox = screen.queryByTestId('upin') as HTMLInputElement;

            expect(textbox).not.toBeInTheDocument();
        });

        describe('when clicking on the UKPRN radio button', () => {

            test('enables UPIN option', async () => {
                renderComponent();
                const radioButton = screen.getByRole('radio', {name: /UPIN/i}) as HTMLInputElement;

                await userEvent.click(radioButton);

                expect(radioButton).toBeTruthy();
                expect(radioButton.checked).toBeTruthy();
            });

            test('renders the UPIN text box', async () => {
                renderComponent();
                const radioButton = screen.getByRole('radio', {name: /UPIN/i}) as HTMLInputElement;
                await userEvent.click(radioButton);

                const textbox = screen.getByTestId('upin') as HTMLInputElement;

                expect(textbox).toBeTruthy();
            });

            test('raises correct callback when entering UPIN', async () => {
                const {callback} = renderComponent();
                const radioButton = screen.getByRole('radio', {name: /UPIN/i}) as HTMLInputElement;
                await userEvent.click(radioButton);
                const textbox = screen.getByTestId('upin') as HTMLInputElement;

                await userEvent.type(textbox, "1234");

                expect(callback).toBeCalled();
                expect(callback).toBeCalledWith("upin", "1234");
            });
        });
    });

    describe('with the URN radio button', () => {

        test('renders the URN radio button', () => {
            renderComponent();

            const radioButton = screen.getByRole('radio', {name: /URN/i});

            expect(radioButton).toBeTruthy();
        });

        test('hides the URN text box by default', () => {
            renderComponent();

            const textbox = screen.queryByTestId('urn') as HTMLInputElement;

            expect(textbox).not.toBeInTheDocument();
        });

        describe('when clicking on the URN radio button', () => {

            test('enables URN option', async () => {
                renderComponent();
                const radioButton = screen.getByRole('radio', {name: /URN/i}) as HTMLInputElement;

                await userEvent.click(radioButton);

                expect(radioButton).toBeTruthy();
                expect(radioButton.checked).toBeTruthy();
            });

            test('renders the URN text box', async () => {
                renderComponent();
                const radioButton = screen.getByRole('radio', {name: /URN/i}) as HTMLInputElement;
                await userEvent.click(radioButton);

                const textbox = screen.getByTestId('urn') as HTMLInputElement;

                expect(textbox).toBeTruthy();
            });

            test('raises correct callback when entering URN', async () => {
                const {callback} = renderComponent();
                const radioButton = screen.getByRole('radio', {name: /URN/i}) as HTMLInputElement;
                await userEvent.click(radioButton);
                const textbox = screen.getByTestId('urn') as HTMLInputElement;

                await userEvent.type(textbox, "2345");

                expect(callback).toBeCalled();
                expect(callback).toBeCalledWith("urn", "2345");
            });
        });
    });
});