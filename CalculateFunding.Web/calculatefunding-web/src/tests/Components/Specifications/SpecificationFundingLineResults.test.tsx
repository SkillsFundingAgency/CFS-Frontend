import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Switch } from "react-router";

import { ErrorContextWrapper } from "../../../context/ErrorContext";
import { CalculationValueType } from "../../../types/CalculationDetails";
import { CalculationType } from "../../../types/CalculationSearchResponse";
import { FundingStructureItemViewModel, FundingStructureType } from "../../../types/FundingStructureItem";
import { JobDetails } from "../../../types/jobDetails";
import { LegacyCalculationType } from "../../../types/Provider/ProviderResultForSpecification";
import { PublishStatus } from "../../../types/PublishStatusModel";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { ValueFormatType } from "../../../types/TemplateBuilderDefinitions";
import { jobSubscriptionTestUtils } from "../../testing-utils";

const { haveJobSuccessfulNotification, haveJobInProgressNotification, setupJobSpy } =
  jobSubscriptionTestUtils({});

describe("<SpecificationFundingLineResults/> tests", () => {
  beforeAll(() => {
    jest.mock("../../../services/providerService", () => mockProviderService());
    jest.mock("../../../services/fundingStructuresService", () => mockFundingLineStructureService());
    jest.mock("../../../services/calculationService", () => mockCalculationService());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("<SpecificationFundingLineResults /> loading checks", () => {
    beforeEach(() => {
      haveJobInProgressNotification({}, {});
      setupJobSpy();
    });

    it("shows loading panel when another job is running", async () => {
      const activeJob = haveJobInProgressNotification({}, {}).latestJob as JobDetails;
      renderView({ activeJob: activeJob });
      await waitFor(() =>
        expect(
          screen.queryByText(/Please wait whilst funding line structure is loading/i)
        ).not.toBeInTheDocument()
      );
      await waitFor(() =>
        expect(screen.getByText(/Please wait. A funding job is running./i)).toBeInTheDocument()
      );
    });
  });

  describe("<SpecificationFundingLineResults service checks />  ", () => {
    beforeEach(() => {
      haveJobSuccessfulNotification({}, {});
      setupJobSpy();
    });

    it("calls getFundingLineStructureService, getCalculationSummaryBySpecificationId and getCalculationCircularDependencies", async () => {
      const { getFundingLineStructureService } = require("../../../services/fundingStructuresService");
      const { getCalculationSummaryBySpecificationId } = require("../../../services/calculationService");
      const { getCalculationCircularDependencies } = require("../../../services/calculationService");
      const {
        getFundingStructureResultsForProviderAndSpecification,
      } = require("../../../services/providerService");

      renderView();

      await waitFor(() => {
        expect(getFundingLineStructureService).toBeCalledTimes(1);
        expect(getCalculationSummaryBySpecificationId).toBeCalledTimes(1);
        expect(getCalculationCircularDependencies).toBeCalledTimes(1);
        expect(getFundingStructureResultsForProviderAndSpecification).toBeCalledTimes(0);
      });
    });

    it("calls getFundingStructureResultsForProviderAndSpecification when providerId provided", async () => {
      const { getFundingLineStructureService } = require("../../../services/fundingStructuresService");
      const { getCalculationSummaryBySpecificationId } = require("../../../services/calculationService");
      const { getCalculationCircularDependencies } = require("../../../services/calculationService");
      const {
        getFundingStructureResultsForProviderAndSpecification,
      } = require("../../../services/providerService");

      renderView();

      await waitFor(() => {
        expect(getFundingLineStructureService).toBeCalledTimes(1);
        expect(getCalculationSummaryBySpecificationId).toBeCalledTimes(1);
        expect(getCalculationCircularDependencies).toBeCalledTimes(1);
        expect(getFundingStructureResultsForProviderAndSpecification).toBeCalledTimes(0);
      });
    });
  });

  describe("<SpecificationFundingLineResults /> page renders correctly ", () => {
    beforeEach(() => {
      haveJobSuccessfulNotification({}, {});
      setupJobSpy();
    });

    it("renders collapsible steps", async () => {
      const { container } = renderView();
      await waitFor(() => expect(container.querySelectorAll(".collapsible-steps")).toHaveLength(1));
    });

    it("shows search box with an autocomplete input in funding line structure tab", async () => {
      const { container } = renderView();
      await waitFor(() =>
        expect(container.querySelectorAll("#fundingline-structure .search-container")).toHaveLength(1)
      );
      await waitFor(() =>
        expect(
          container.querySelectorAll("#fundingline-structure .search-container #input-auto-complete")
        ).toHaveLength(1)
      );
    });

    it("shows open-close all buttons correctly", async () => {
      const { container } = renderView();
      await waitFor(() =>
        expect(
          container.querySelectorAll("#fundingline-structure .govuk-accordion__open-all")[0]
        ).toBeVisible()
      );
      await waitFor(() =>
        expect(
          container.querySelectorAll("#fundingline-structure .govuk-accordion__open-all")[1]
        ).not.toBeVisible()
      );

      fireEvent.click(container.querySelectorAll("#fundingline-structure .govuk-accordion__open-all")[0]);

      await waitFor(() =>
        expect(
          container.querySelectorAll("#fundingline-structure .govuk-accordion__open-all")[0]
        ).not.toBeVisible()
      );
      await waitFor(() =>
        expect(
          container.querySelectorAll("#fundingline-structure .govuk-accordion__open-all")[1]
        ).toBeVisible()
      );
    });
  });

  describe("<SpecificationFundingLineResults /> when providerId provided", () => {
    it("renders calculation value and format correctly", async () => {
      haveJobSuccessfulNotification({}, {});
      setupJobSpy();

      const { getFundingLineStructureService } = require("../../../services/fundingStructuresService");
      const { getCalculationSummaryBySpecificationId } = require("../../../services/calculationService");

      renderView();

      await waitFor(() => {
        expect(getFundingLineStructureService).toBeCalled();
        expect(getCalculationSummaryBySpecificationId).toBeCalled();
      });

      expect(await screen.findByText(/100/)).toBeInTheDocument();
      expect(screen.getByText(/200/)).toBeInTheDocument();
      expect(screen.getByText(/Number/)).toBeInTheDocument();
      expect(screen.getByText(/Currency/)).toBeInTheDocument();
    });
  });
});

const renderView = ({ activeJob }: { activeJob?: JobDetails } = {}) => {
  const {
    SpecificationFundingLineResults,
  } = require("../../../components/Specifications/SpecificationFundingLineResults");
  return render(
    <MemoryRouter initialEntries={["/SpecificationFundingLineResults/SPEC123/FS1/FP1/Completed"]}>
      <QueryClientProvider client={new QueryClient()}>
        <Switch>
          <ErrorContextWrapper>
            <Route path="/SpecificationFundingLineResults/:specificationId/:fundingStreamId/:fundingPeriodId/:publishStatus">
              <SpecificationFundingLineResults
                specification={testSpec}
                providerId={"test provider id"}
                activeJob={activeJob}
                clearSpecificationFromCache={jest.fn()}
                monitorAssignTemplateCalculationsJob={jest.fn()}
              />
            </Route>
          </ErrorContextWrapper>
        </Switch>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const testSpec: SpecificationSummary = {
  coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
  name: "Wizard Training",
  approvalStatus: "Draft",
  description: "",
  fundingPeriod: {
    id: "FP123",
    name: "2019-20",
  },
  fundingStreams: [
    {
      name: "FS123",
      id: "Wizard Training Scheme",
    },
  ],
  id: "ABC123",
  isSelectedForFunding: true,
  providerVersionId: "",
  templateIds: {},
  dataDefinitionRelationshipIds: [],
};

const mockFundingLineStructureService = () => {
  const fundingLineStructureService = jest.requireActual("../../../services/fundingStructuresService");
  const mockedFundingStructureItems: FundingStructureItemViewModel[] = [
    {
      level: 1,
      name: "fundingline1",
      calculationId: "",
      fundingLineCode: null,
      value: "",
      calculationType: "",
      templateId: 1,
      calculationPublishStatus: undefined,
      type: FundingStructureType.FundingLine,
      fundingStructureItems: [
        {
          level: 2,
          name: "calc123",
          calculationId: "123",
          fundingLineCode: "",
          value: "100",
          calculationType: "Number",
          templateId: 2,
          calculationPublishStatus: PublishStatus.Draft,
          type: FundingStructureType.Calculation,
          fundingStructureItems: [],
        },
        {
          level: 2,
          name: "calc456",
          calculationId: "456",
          fundingLineCode: "",
          value: "200",
          calculationType: "Currency",
          templateId: 3,
          calculationPublishStatus: PublishStatus.Draft,
          type: FundingStructureType.Calculation,
          fundingStructureItems: [],
        },
      ],
      expanded: true,
    },
  ];
  return {
    ...fundingLineStructureService,
    getFundingLineStructureService: jest.fn(() =>
      Promise.resolve({
        data: mockedFundingStructureItems,
      })
    ),
  };
};

const mockProviderService = () => {
  const providerService = jest.requireActual("../../../services/providerService");
  return {
    ...providerService,
    getFundingStructureResultsForProviderAndSpecification: jest.fn(() =>
      Promise.resolve({
        data: {
          specificationId: "spec",
          specificationName: "spec name",
          fundingStreamId: "fundingStreamId",
          fundingStreamName: "fundingStreamName",
          SpecificationFundingLineResults: {
            1: {
              templateLineId: 1,
              fundingLineCode: null,
              name: "fundingline1",
              value: 0,
              exceptionMessage: null,
            },
          },
          calculationResults: {
            2: {
              templateCalculationId: 2,
              name: "calc123",
              calculationId: "123",
              status: PublishStatus.Draft,
              valueFormat: ValueFormatType.Number,
              templateCalculationType: LegacyCalculationType.Number,
              value: 100,
              exceptionMessage: "exception",
            },
            3: {
              templateCalculationId: 3,
              name: "calc456",
              calculationId: "456",
              status: PublishStatus.Draft,
              valueFormat: ValueFormatType.Currency,
              templateCalculationType: LegacyCalculationType.Cash,
              value: 200,
              exceptionMessage: "oops",
            },
          },
        },
        status: 200,
      })
    ),
  };
};

const mockCalculationService = () => {
  const calculationService = jest.requireActual("../../../services/calculationService");
  return {
    ...calculationService,
    getCalculationSummaryBySpecificationId: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            calculationType: CalculationType.Template,
            publishStatus: PublishStatus.Draft,
            version: 1,
            type: CalculationValueType.Number,
            id: "123",
            name: "calc123",
          },
          {
            calculationType: CalculationType.Template,
            publishStatus: PublishStatus.Draft,
            version: 1,
            type: CalculationValueType.Currency,
            id: "456",
            name: "calc456",
          },
        ],
        status: 200,
      })
    ),
    getCalculationCircularDependencies: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            node: {
              calculationid: "456",
              specificationId: "spec",
              calculationName: "calc456",
              calculationType: "Template",
              fundingSteam: "fundingStreamId",
            },
            relationships: [
              {
                source: {
                  calculationid: "456",
                  specificationId: "spec",
                  calculationName: "calc456",
                  calculationType: "Template",
                  fundingSteam: "fundingStreamId",
                },
                target: {
                  calculationid: "789",
                  specificationId: "spec",
                  calculationName: "calc789",
                  calculationType: "Template",
                  fundingSteam: "fundingStreamId",
                },
              },
            ],
          },
        ],
        status: 200,
      })
    ),
  };
};
