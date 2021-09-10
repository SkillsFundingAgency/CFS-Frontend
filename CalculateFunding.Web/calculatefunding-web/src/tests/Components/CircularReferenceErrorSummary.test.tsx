import { shallow } from "enzyme";
import React from "react";

import { CircularReferenceErrorSummary } from "../../components/CircularReferenceErrorSummary";
import { CircularReferenceError } from "../../types/Calculations/CircularReferenceError";

describe("<CircularReferenceErrorSummary>", () => {
  it("does not render when there are no circular reference errors", () => {
    const wrapper = shallow(<CircularReferenceErrorSummary errors={[]} defaultSize={3} />);
    expect(wrapper.find(".govuk-error-summary")).toHaveLength(0);
  });

  it("renders when there are circular reference errors", () => {
    const wrapper = shallow(
      <CircularReferenceErrorSummary errors={mockCircularReferenceErrors} defaultSize={3} />
    );
    expect(wrapper.find(".govuk-error-summary")).toHaveLength(1);
    expect(wrapper.find("button")).toHaveLength(0);
  });

  it("renders 'show more' button when there are more errors than default size", () => {
    const wrapper = shallow(
      <CircularReferenceErrorSummary errors={mockCircularReferenceErrors} defaultSize={1} />
    );
    expect(wrapper.find(".govuk-error-summary")).toHaveLength(1);
    expect(wrapper.find("button")).toHaveLength(1);
    const links = wrapper.find(".govuk-link");
    expect(links).toHaveLength(2);
  });

  it("shows all links when 'show more' button is clicked", () => {
    const wrapper = shallow(
      <CircularReferenceErrorSummary errors={mockCircularReferenceErrors} defaultSize={1} />
    );
    wrapper.find("button").simulate("click");
    const links = wrapper.find(".govuk-link");
    expect(links).toHaveLength(3);
  });
});

const mockCircularReferenceErrors: CircularReferenceError[] = [
  {
    node: {
      calculationid: "f3d3fa7a-df89-445c-b150-2cece75de664",
      specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
      calculationName: "Total Allocation",
      calculationType: "Template",
      fundingStream: "PSG",
    },
    relationships: [
      {
        source: {
          calculationid: "f3d3fa7a-df89-445c-b150-2cece75de664",
          specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
          calculationName: "Total Allocation",
          calculationType: "Template",
          fundingStream: "PSG",
        },
        target: {
          calculationid: "b58b38d7-60a6-48c7-8cf9-50e7737a5016",
          specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
          calculationName: "Pupil rate threshold",
          calculationType: "Template",
          fundingStream: "PSG",
        },
      },
    ],
  },
  {
    node: {
      calculationid: "b58b38d7-60a6-48c7-8cf9-50e7737a5016",
      specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
      calculationName: "Pupil rate threshold",
      calculationType: "Template",
      fundingStream: "PSG",
    },
    relationships: [
      {
        source: {
          calculationid: "b58b38d7-60a6-48c7-8cf9-50e7737a5016",
          specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
          calculationName: "Pupil rate threshold",
          calculationType: "Template",
          fundingStream: "PSG",
        },
        target: {
          calculationid: "9995b57e-1033-4f54-a4e2-d5b3cb691353",
          specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
          calculationName: "Eligible Pupils",
          calculationType: "Template",
          fundingStream: "PSG",
        },
      },
    ],
  },
  {
    node: {
      calculationid: "9995b57e-1033-4f54-a4e2-d5b3cb691353",
      specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
      calculationName: "Eligible Pupils",
      calculationType: "Template",
      fundingStream: "PSG",
    },
    relationships: [
      {
        source: {
          calculationid: "9995b57e-1033-4f54-a4e2-d5b3cb691353",
          specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
          calculationName: "Eligible Pupils",
          calculationType: "Template",
          fundingStream: "PSG",
        },
        target: {
          calculationid: "f3d3fa7a-df89-445c-b150-2cece75de664",
          specificationId: "36e5c7db-45a1-400a-b436-700f8d512650",
          calculationName: "Total Allocation",
          calculationType: "Template",
          fundingStream: "PSG",
        },
      },
    ],
  },
];
