import React from "react";
import {getByText, render, screen} from "@testing-library/react";
import {Tag, TagTypes} from "../../components/Tag";

describe('<Tag>', () =>{
    it('should have correct text', () => {
        render(<Tag type={TagTypes.default} text={"default"} />);
        expect(screen.getByText("default"));
    });

    it('should have correct colour', () =>{
        render(<Tag text={'Color Check'} type={TagTypes.red} />);
        expect(screen.getByText('Color Check')).toHaveAttribute('class', 'govuk-tag govuk-tag--red');
    })
})
