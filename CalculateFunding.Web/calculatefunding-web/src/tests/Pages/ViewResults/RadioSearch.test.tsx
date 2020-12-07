import {render, screen} from "@testing-library/react";
import React from "react";

function renderComponent() {
    const {RadioSearch} = require('../../../Pages/ViewResults/RadioSearch');

    return render(
        <RadioSearch text={"Test text"} selectedSearchType={"name"} timeout={900} radioId={"name-id"}
                     radioName={"radio-name"} searchType={"name"} minimumChars={2} callback={false}/>)
}

describe("<RadioSearch /> renders correctly", () => {
    it("with the radio input defined", async () => {
        renderComponent();
        expect(await screen.getByRole("radio")).toBeDefined();
    });

    it("with the text input defined", async () => {
        renderComponent();
        expect(await screen.getByRole("textbox")).toBeDefined();
    });
});