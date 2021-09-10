import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import React from "react";

import { CalculationItem } from "../../../components/TemplateBuilder/CalculationItem";
import {
  AggregrationType,
  Calculation,
  CalculationDictionaryItem,
  CalculationType,
  NodeType,
  ValueFormatType,
} from "../../../types/TemplateBuilderDefinitions";

const cashCalc: Calculation = {
  id: "n1",
  name: "My Calc1",
  templateCalculationId: 1,
  kind: NodeType.Calculation,
  type: CalculationType.Cash,
  aggregationType: AggregrationType.None,
  formulaText: "123",
  valueFormat: ValueFormatType.Currency,
};

const pupilNumberCalc: Calculation = {
  id: "a1",
  name: "Adjustment Calc",
  templateCalculationId: 1,
  kind: NodeType.Calculation,
  type: CalculationType.PupilNumber,
  aggregationType: AggregrationType.None,
  formulaText: "123",
  valueFormat: ValueFormatType.Number,
};

const allCalcs: CalculationDictionaryItem[] = [
  { id: "n1", templateCalculationId: 1, name: "My Calc 1", aggregationType: AggregrationType.None },
  { id: "n2", templateCalculationId: 2, name: "My Calc 2", aggregationType: AggregrationType.Sum },
  { id: "n3", templateCalculationId: 3, name: "My Calc 3", aggregationType: AggregrationType.None },
  { id: "n4", templateCalculationId: 4, name: "My Calc 4", aggregationType: AggregrationType.Average },
  { id: "n5", templateCalculationId: 5, name: "My Calc 5", aggregationType: AggregrationType.Sum },
];

describe("<CalculationItem />", () => {
  it("renders aggregationType of None and valueFormat of String when type Enum selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    expect(wrapper.find("#calculation-allowed-enum-values")).toHaveLength(0);

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Enum" } });

    expect(wrapper.find("#calculation-aggregation-type").props().value).toBe("None");
    expect(wrapper.find("#calculation-aggregation-type").children().length).toBe(1);
    expect(wrapper.find("#calculation-value-format").props().value).toBe("String");
    expect(wrapper.find("#calculation-value-format").children().length).toBe(1);
    expect(wrapper.find("#add-tag")).toHaveLength(1);
  });

  it("renders allowedEnumTypeValues field when type Enum selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    expect(wrapper.find("#add-tag")).toHaveLength(0);

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Enum" } });

    expect(wrapper.find("#add-tag")).toHaveLength(1);
  });

  it("shows error when click save and allowedEnumTypeValues field is empty", async () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Enum" } });
    wrapper.find("#save-button").simulate("click");

    await waitFor(() => {
      expect(wrapper.find(".govuk-error-message")).toHaveLength(1);
    });
  });

  it("shows error when allowedEnumTypeValues field contains non-unique options", async () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Enum" } });
    wrapper.find("#add-tag").simulate("change", { target: { value: "Option1" } });
    wrapper.find("[data-testid='add-tag-button']").simulate("click");
    wrapper.find("#add-tag").simulate("change", { target: { value: "Option1" } });
    wrapper.find("[data-testid='add-tag-button']").simulate("click");

    await waitFor(() => {
      expect(wrapper.find(".govuk-error-message")).toHaveLength(1);
    });
  });

  it("does not show error when allowedEnumTypeValues field contains valid options", async () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Enum" } });
    wrapper.find("#add-tag").simulate("change", { target: { value: "Option1" } });
    wrapper.find("[data-testid='add-tag-button']").simulate("click");
    wrapper.find("#save-button").simulate("click");

    await waitFor(() => {
      expect(wrapper.find(".govuk-error-message")).toHaveLength(0);
    });
  });

  it("renders valueFormat of Boolean when type Boolean selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Boolean" } });

    expect(wrapper.find("#calculation-value-format").props().value).toBe("Boolean");
    expect(wrapper.find("#calculation-value-format").children().length).toBe(1);
  });

  it("renders numerator and denominator fields when aggregationType is GroupRate", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    expect(wrapper.find("#group-rate-numerator")).toHaveLength(0);
    expect(wrapper.find("#group-rate-denominator")).toHaveLength(0);

    wrapper.find("#calculation-aggregation-type").simulate("change", { target: { value: "GroupRate" } });

    expect(wrapper.find("#group-rate-numerator")).toHaveLength(1);
    expect(wrapper.find("#group-rate-denominator")).toHaveLength(1);
  });

  it("renders correct calculations for numerator and denominator drop-downs", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-aggregation-type").simulate("change", { target: { value: "GroupRate" } });

    // Initially numerator and denominator has values 0, 2 and 5
    expect(wrapper.find("#group-rate-numerator").children()).toHaveLength(3);
    expect(wrapper.find("#group-rate-denominator").children()).toHaveLength(3);

    // Select 2 for numerator
    wrapper.find("#group-rate-numerator").simulate("change", { target: { value: 2 } });

    // Now denominator has 0 and 5
    expect(wrapper.find("#group-rate-denominator").children()).toHaveLength(2);
  });

  it("renders calculationA and calculationB fields when aggregationType is PercentageChangeBetweenAandB", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    expect(wrapper.find("#percentage-change-calculation-a")).toHaveLength(0);
    expect(wrapper.find("#percentage-change-calculation-b")).toHaveLength(0);

    wrapper
      .find("#calculation-aggregation-type")
      .simulate("change", { target: { value: "PercentageChangeBetweenAandB" } });

    expect(wrapper.find("#percentage-change-calculation-a")).toHaveLength(1);
    expect(wrapper.find("#percentage-change-calculation-b")).toHaveLength(1);
  });

  it("renders correct calculations for calculation A and calculation B drop-downs", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper
      .find("#calculation-aggregation-type")
      .simulate("change", { target: { value: "PercentageChangeBetweenAandB" } });

    // Initially calculationA and calculationB has values 0, 2, 3, 4 and 5
    expect(wrapper.find("#percentage-change-calculation-a").children()).toHaveLength(5);
    expect(wrapper.find("#percentage-change-calculation-b").children()).toHaveLength(5);

    // Select 2 for calculationA
    wrapper.find("#percentage-change-calculation-a").simulate("change", { target: { value: 2 } });

    // Now calculationB has 0, 3, 4 and 5
    expect(wrapper.find("#percentage-change-calculation-b").children()).toHaveLength(4);
  });

  it("shows error if editing template calculation id and already in use", async () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-id").simulate("change", { target: { value: "2" } });
    wrapper.find("#save-button").simulate("click");

    await waitFor(() => {
      expect(wrapper.find(".govuk-error-message")).toHaveLength(1);
    });
  });

  it("shows error if saving empty template calculation id", async () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-id").simulate("change", { target: { value: "" } });
    wrapper.find("#save-button").simulate("click");

    await waitFor(() => {
      expect(wrapper.find(".govuk-error-message")).toHaveLength(1);
    });
  });

  it("shows error if editing template calculation id and value is already taken", async () => {
    const refreshNextIdMock = jest.fn();

    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={refreshNextIdMock}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-id").simulate("change", { target: { value: "2" } });
    wrapper.find("#save-button").simulate("click");

    await waitFor(() => {
      expect(wrapper.find(".govuk-error-message")).toHaveLength(1);
      expect(wrapper.find(".govuk-error-message").text()).toBe(
        "Error: This calculation ID is already in use."
      );
    });
  });

  it("does not show error if editing template calculation id and value is valid", async () => {
    const refreshNextIdMock = jest.fn();

    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={refreshNextIdMock}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-id").simulate("change", { target: { value: "99" } });
    wrapper.find("#save-button").simulate("click");

    await waitFor(() => {
      expect(wrapper.find(".govuk-error-message")).toHaveLength(0);
    });
  });

  it("renders delete button if allowDelete is true", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    expect(wrapper.find('[data-testid="delete-button"]')).toHaveLength(1);
  });

  it("does not render delete button if allowDelete is false", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={false}
      />
    );

    expect(wrapper.find('[data-testid="delete-button"]')).toHaveLength(0);
  });

  it("renders valueFormat of String when type Enum selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Enum" } });

    expect(wrapper.find("#calculation-value-format").props().value).toBe("String");
    expect(wrapper.find("#calculation-value-format").children().length).toBe(1);
  });

  it("renders valueFormat of Currency when type Cash selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={pupilNumberCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Adjustment" } });

    expect(wrapper.find("#calculation-value-format").props().value).toBe("Currency");
    expect(wrapper.find("#calculation-value-format").children().length).toBe(1);
  });

  it("renders valueFormat of Currency when type Adjustment selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={pupilNumberCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Cash" } });

    expect(wrapper.find("#calculation-value-format").props().value).toBe("Currency");
    expect(wrapper.find("#calculation-value-format").children().length).toBe(1);
  });

  it("restricts valueFormats when type Rate selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Rate" } });

    expect(wrapper.find("#calculation-value-format").props().value).toBeUndefined();
    expect(wrapper.find("#calculation-value-format").children().length).toBe(3);
    expect(wrapper.find("#calculation-value-format").childAt(0).text()).toBe("Please select");
    expect(wrapper.find("#calculation-value-format").childAt(1).text()).toBe("Percentage");
    expect(wrapper.find("#calculation-value-format").childAt(2).text()).toBe("Currency");
  });

  it("restricts valueFormats when type Number selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Number" } });

    expect(wrapper.find("#calculation-value-format").props().value).toBe("Number");
    expect(wrapper.find("#calculation-value-format").children().length).toBe(1);
  });

  it("restricts valueFormats when type PupilNumber selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "PupilNumber" } });

    expect(wrapper.find("#calculation-value-format").props().value).toBe("Number");
    expect(wrapper.find("#calculation-value-format").children().length).toBe(1);
  });

  it("restricts valueFormats when type Weighting selected", () => {
    const wrapper = mount(
      <CalculationItem
        node={cashCalc}
        calcs={allCalcs}
        isEditMode={true}
        updateNode={jest.fn()}
        openSideBar={jest.fn()}
        deleteNode={jest.fn()}
        cloneCalculation={jest.fn()}
        refreshNextId={jest.fn()}
        allowDelete={true}
      />
    );

    wrapper.find("#calculation-type").simulate("change", { target: { value: "Weighting" } });

    expect(wrapper.find("#calculation-value-format").props().value).toBeUndefined();
    expect(wrapper.find("#calculation-value-format").children().length).toBe(3);
    expect(wrapper.find("#calculation-value-format").childAt(0).text()).toBe("Please select");
    expect(wrapper.find("#calculation-value-format").childAt(1).text()).toBe("Number");
    expect(wrapper.find("#calculation-value-format").childAt(2).text()).toBe("Percentage");
  });
});
