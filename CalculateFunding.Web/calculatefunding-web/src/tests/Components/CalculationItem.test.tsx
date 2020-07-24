import React from "react";
import { CalculationItem } from "../../components/CalculationItem";
import { mount } from "enzyme";
import { Calculation, NodeType, CalculationType, AggregrationType, ValueFormatType, CalculationDictionaryItem } from "../../types/TemplateBuilderDefinitions";
import { waitFor, screen, render } from "@testing-library/react";

const calc: Calculation = {
    id: "n1",
    name: "My Calc1",
    templateCalculationId: 1,
    kind: NodeType.Calculation,
    type: CalculationType.Cash,
    aggregationType: AggregrationType.None,
    formulaText: "123",
    valueFormat: ValueFormatType.Currency
};

const allCalcs: CalculationDictionaryItem[] = [
    { id: "n1", templateCalculationId: 1, name: "My Calc 1", aggregationType: AggregrationType.None },
    { id: "n2", templateCalculationId: 2, name: "My Calc 2", aggregationType: AggregrationType.Sum },
    { id: "n3", templateCalculationId: 3, name: "My Calc 3", aggregationType: AggregrationType.None },
    { id: "n4", templateCalculationId: 4, name: "My Calc 4", aggregationType: AggregrationType.Average },
    { id: "n5", templateCalculationId: 5, name: "My Calc 5", aggregationType: AggregrationType.Sum },
];

describe('<CalculationItem />', () => {
    it('renders aggregationType of None and valueFormat of String when type Enum selected', () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        expect(wrapper.find('#calc-enum-values')).toHaveLength(0);

        wrapper.find('#calc-type').simulate("change", { target: { value: "Enum" } });

        expect(wrapper.find('#calc-aggregation-type').props().value).toBe("None");
        expect(wrapper.find('#calc-aggregation-type').children().length).toBe(1)
        expect(wrapper.find('#calc-value-format').props().value).toBe("String");
        expect(wrapper.find('#calc-value-format').children().length).toBe(1);
        expect(wrapper.find('#add-tag')).toHaveLength(1);
    });

    it('renders allowedEnumTypeValues field when type Enum selected', () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        expect(wrapper.find('#add-tag')).toHaveLength(0);

        wrapper.find('#calc-type').simulate("change", { target: { value: "Enum" } });

        expect(wrapper.find('#add-tag')).toHaveLength(1);
    });

    it('shows error when click save and allowedEnumTypeValues field is empty', async () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        wrapper.find('#calc-type').simulate("change", { target: { value: "Enum" } });
        wrapper.find('#save-button').simulate("click");

        await waitFor(() => {
            expect(wrapper.find('.govuk-error-message')).toHaveLength(1);
        });
    });

    it('shows error when allowedEnumTypeValues field contains non-unique options', async () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        wrapper.find('#calc-type').simulate("change", { target: { value: "Enum" } });
        wrapper.find('#add-tag').simulate("change", { target: { value: "Option1" } });
        wrapper.find("[data-testid='add-tag-button']").simulate("click");
        wrapper.find('#add-tag').simulate("change", { target: { value: "Option1" } });
        wrapper.find("[data-testid='add-tag-button']").simulate("click");

        await waitFor(() => {
            expect(wrapper.find('.govuk-error-message')).toHaveLength(1);
        });
    });

    it('does not show error when allowedEnumTypeValues field contains valid options', async () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        wrapper.find('#calc-type').simulate("change", { target: { value: "Enum" } });
        wrapper.find('#add-tag').simulate("change", { target: { value: "Option1" } });
        wrapper.find("[data-testid='add-tag-button']").simulate("click");
        wrapper.find('#save-button').simulate("click");

        await waitFor(() => {
            expect(wrapper.find('.govuk-error-message')).toHaveLength(0);
        });
    });

    it('renders valueFormat of Boolean when type Boolean selected', () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        wrapper.find('#calc-type').simulate("change", { target: { value: "Boolean" } });

        expect(wrapper.find('#calc-value-format').props().value).toBe("Boolean");
        expect(wrapper.find('#calc-value-format').children().length).toBe(1);
    });

    it('renders numerator and denominator fields when aggregationType is GroupRate', () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        expect(wrapper.find('#calc-numerator')).toHaveLength(0);
        expect(wrapper.find('#calc-denominator')).toHaveLength(0);

        wrapper.find('#calc-aggregation-type').simulate("change", { target: { value: "GroupRate" } });

        expect(wrapper.find('#calc-numerator')).toHaveLength(1);
        expect(wrapper.find('#calc-denominator')).toHaveLength(1);
    });

    it('renders correct calculations for numerator and denominator drop-downs', () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        wrapper.find('#calc-aggregation-type').simulate("change", { target: { value: "GroupRate" } });

        // Initially numerator and denominator has values 0, 2 and 5
        expect(wrapper.find('#calc-numerator').children()).toHaveLength(3);
        expect(wrapper.find('#calc-denominator').children()).toHaveLength(3);

        // Select 2 for numerator
        wrapper.find('#calc-numerator').simulate("change", { target: { value: 2 } });

        // Now denominator has 0 and 5
        expect(wrapper.find('#calc-denominator').children()).toHaveLength(2);
    });

    it('renders calculationA and calculationB fields when aggregationType is PercentageChangeBetweenAandB', () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        expect(wrapper.find('#calc-calculation-a')).toHaveLength(0);
        expect(wrapper.find('#calc-calculation-b')).toHaveLength(0);

        wrapper.find('#calc-aggregation-type').simulate("change", { target: { value: "PercentageChangeBetweenAandB" } });

        expect(wrapper.find('#calc-calculation-a')).toHaveLength(1);
        expect(wrapper.find('#calc-calculation-b')).toHaveLength(1);
    });

    it('renders correct calculations for calculationA and calculationB drop-downs', () => {
        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={jest.fn()}
        />);

        wrapper.find('#calc-aggregation-type').simulate("change", { target: { value: "PercentageChangeBetweenAandB" } });

        // Initially calculationA and calculationB has values 0, 2, 3, 4 and 5
        expect(wrapper.find('#calc-calculation-a').children()).toHaveLength(5);
        expect(wrapper.find('#calc-calculation-b').children()).toHaveLength(5);

        // Select 2 for calculationA
        wrapper.find('#calc-calculation-a').simulate("change", { target: { value: 2 } });

        // Now calculationB has 0, 3, 4 and 5
        expect(wrapper.find('#calc-calculation-b').children()).toHaveLength(4);
    });

    it("shows error if editing template calculation id and already in use", async () => {
        const checkIfTemplateCalculationIdInUseMock = jest.fn().mockReturnValue(true);

        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={checkIfTemplateCalculationIdInUseMock}
        />);

        wrapper.find('#template-calculation-id').simulate("change", { target: { value: "2" } });
        wrapper.find('#save-button').simulate("click");

        await waitFor(() => {
            expect(wrapper.find('.govuk-error-message')).toHaveLength(1);
        });
    });

    it("shows error if saving empty template calculation id", async () => {
        const checkIfTemplateCalculationIdInUseMock = jest.fn().mockReturnValue(false);

        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={checkIfTemplateCalculationIdInUseMock}
        />);

        wrapper.find('#template-calculation-id').simulate("change", { target: { value: "" } });
        wrapper.find('#save-button').simulate("click");

        await waitFor(() => {
            expect(wrapper.find('.govuk-error-message')).toHaveLength(1);
        });
    });

    it("does not show error if editing template calculation id and value is valid", async () => {
        const checkIfTemplateCalculationIdInUseMock = jest.fn().mockReturnValue(false);

        const wrapper = mount(<CalculationItem
            node={calc}
            calcs={allCalcs}
            updateNode={jest.fn()}
            openSideBar={jest.fn()}
            deleteNode={jest.fn()}
            cloneCalculation={jest.fn()}
            checkIfTemplateCalculationIdInUse={checkIfTemplateCalculationIdInUseMock}
        />);

        wrapper.find('#template-calculation-id').simulate("change", { target: { value: "2" } });
        wrapper.find('#save-button').simulate("click");

        await waitFor(() => {
            expect(wrapper.find('.govuk-error-message')).toHaveLength(0);
        });
    });
});