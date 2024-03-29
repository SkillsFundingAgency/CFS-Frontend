import "@testing-library/jest-dom/extend-expect";

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Switch } from "react-router";

import * as circularRefErrorsHook from "../../../hooks/Calculations/useCalculationCircularDependencies";
import { CalculationCircularDependenciesQueryResult } from "../../../hooks/Calculations/useCalculationCircularDependencies";
import * as permissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import { CalculationSearchResult, CalculationType } from "../../../types/CalculationSearchResponse";
import { Permission } from "../../../types/Permission";
import { PublishStatus } from "../../../types/PublishStatusModel";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { ValueType } from "../../../types/ValueType";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";

describe("<AdditionalCalculations /> tests", () => {
  beforeAll(() => {
    jest.mock("../../../services/calculationService", () => mockCalculationService());
    jest.mock("../../../services/specificationService", () => mockSpecificationService());
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCircularReferenceErrors.mockReset();
    mockPermissions.mockReset();
  });

  describe("<AdditionalCalculations /> with permissions but without create button", () => {
    beforeEach(async () => {
      mockCircularReferenceErrors.mockImplementation(() => noCircularRefErrorsResult);
      mockPermissions.mockImplementation(() => fullPermissions);
      await renderComponent(false, undefined);
    });

    it("create button is not displayed", async () => {
      expect(screen.queryByText(/Create a calculation/i)).not.toBeInTheDocument();
    });

    it("calculation link to view calculation results", async () => {
      expect(screen.getByText(testCalc1.name).closest("a")).toHaveAttribute(
        "href",
        "/ViewCalculationResults/54723"
      );
    });
  });

  describe("<AdditionalCalculations /> without create permissions but with create button", () => {
    beforeEach(async () => {
      mockCircularReferenceErrors.mockImplementation(() => noCircularRefErrorsResult);
      mockPermissions.mockImplementation(() => noPermissions);
      await renderComponent(true, undefined);
    });

    it("create button is not displayed", async () => {
      expect(screen.queryByText(/Create a calculation/i)).not.toBeInTheDocument();
    });
  });

  describe("<AdditionalCalculations /> with permissions but without circular ref error", () => {
    beforeEach(async () => {
      mockCircularReferenceErrors.mockImplementation(() => noCircularRefErrorsResult);
      mockPermissions.mockImplementation(() => fullPermissions);
      await renderComponent(true, undefined);
    });

    it("calculation link to view calculation results", async () => {
      expect(screen.getByText(testCalc1.name).closest("a")).toHaveAttribute(
        "href",
        "/Specifications/EditCalculation/54723"
      );
    });

    it("it calls the services correct number of times", async () => {
      const {
        getAdditionalCalculationsForSpecificationService,
      } = require("../../../services/specificationService");
      await waitFor(() => expect(getAdditionalCalculationsForSpecificationService).toBeCalledTimes(1));
    });

    it("create button is displayed", async () => {
      expect(await screen.findByText(/Create a calculation/i)).toBeInTheDocument();
    });

    it("additional calculations are displayed", async () => {
      expect(await screen.findByText(testCalc1.name)).toBeInTheDocument();
      expect(await screen.findByText(testCalc2.name)).toBeInTheDocument();
      expect(await screen.findByText(testCalc3.name)).toBeInTheDocument();
    });

    it("renders non-error statuses for calculations", async () => {
      expect(await screen.findByText(testCalc1.status)).toBeInTheDocument();
      expect(await screen.findByText(testCalc2.status)).toBeInTheDocument();
      expect(await screen.findByText(testCalc3.status)).toBeInTheDocument();
      expect(screen.queryByText("Error")).not.toBeInTheDocument();
    });

    it("does not render error message", async () => {
      expect(screen.queryAllByText(/circular reference detected in calculation script/)).toHaveLength(0);
    });
  });

  describe("<AdditionalCalculations /> with permissions and with providerId", () => {
    beforeEach(async () => {
      mockCircularReferenceErrors.mockImplementation(() => noCircularRefErrorsResult);
      mockPermissions.mockImplementation(() => fullPermissions);
      await renderComponent(true, "PROVIDER123");
    });

    it("calculation link to view calculation results", async () => {
      expect(screen.getByText(testCalc1.name).closest("a")).toHaveAttribute(
        "href",
        "/Specifications/EditCalculation/54723"
      );
    });

    it("it calls the services correct number of times", async () => {
      const { searchForCalculationsByProviderService } = require("../../../services/calculationService");
      await waitFor(() => expect(searchForCalculationsByProviderService).toBeCalledTimes(1));
    });

    it("renders the create calculation link correctly", async () => {
      const button = (await screen.findByRole("link", {
        name: /Create additional calculation/,
      })) as HTMLAnchorElement;
      expect(button).toBeInTheDocument();
      expect(button.getAttribute("href")).toBe("/Specifications/CreateAdditionalCalculation/SPEC123");
    });

    it("create button is displayed", async () => {
      expect(await screen.findByText(/Create a calculation/i)).toBeInTheDocument();
    });

    it("additional calculations are displayed", async () => {
      expect(await screen.findByText(testCalc1.name)).toBeInTheDocument();
      expect(await screen.findByText(testCalc2.name)).toBeInTheDocument();
      expect(await screen.findByText(testCalc3.name)).toBeInTheDocument();
    });

    it("does not render status columns", async () => {
      expect(await screen.queryByText(testCalc1.status)).not.toBeInTheDocument();
      expect(await screen.queryByText(testCalc2.status)).not.toBeInTheDocument();
      expect(await screen.queryByText(testCalc3.status)).not.toBeInTheDocument();
      expect(screen.queryByText("Error")).not.toBeInTheDocument();
    });

    it("renders value columns with correct formatting", async () => {
      expect(await screen.findByText(/£100/)).toBeInTheDocument();
      expect(await screen.findByText(/200/)).toBeInTheDocument();
      expect(await screen.findByText(/Excluded/)).toBeInTheDocument();
    });

    it("does not render error message", async () => {
      expect(screen.queryAllByText(/circular reference detected in calculation script/)).toHaveLength(0);
    });
  });

  describe("<AdditionalCalculations /> with permissions but with circular ref error", () => {
    beforeEach(async () => {
      mockCircularReferenceErrors.mockImplementation(() => withCircularRefErrorsResult);
      mockPermissions.mockImplementation(() => fullPermissions);
      await renderComponent(true, undefined);
    });

    it("additional calculations are displayed", async () => {
      expect(await screen.findByText(testCalc1.name)).toBeInTheDocument();
      expect(await screen.findByText(testCalc2.name)).toBeInTheDocument();
      expect(await screen.findByText(testCalc3.name)).toBeInTheDocument();
    });

    it("error message is displayed once for calculation with circular reference error", async () => {
      expect(await screen.findAllByText(/circular reference detected in calculation script/)).toHaveLength(1);
    });

    it("error status is displayed for calculation without circular reference error", async () => {
      expect(screen.queryByText(testCalc2.status)).not.toBeInTheDocument();
      expect(await screen.findByText(testCalc3.status)).toBeInTheDocument();
      expect(await screen.findByText(testCalc1.status)).toBeInTheDocument();
    });
  });
});

const renderComponent = async (showCreateButton: boolean, providerId: string | undefined) => {
  const { AdditionalCalculations } = require("../../../components/Calculations/AdditionalCalculations");
  const component = render(
    <MemoryRouter initialEntries={["/AdditionalCalculations/SPEC123"]}>
      <QueryClientProvider client={new QueryClient()}>
        <Switch>
          <Route path="/AdditionalCalculations/:specificationId">
            <AdditionalCalculations
              specificationId="SPEC123"
              addError={jest.fn()}
              providerId={providerId}
              showCreateButton={showCreateButton}
            />
          </Route>
        </Switch>
      </QueryClientProvider>
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
  return component;
};

const fundingStream: FundingStream = {
  name: "FS123",
  id: "Wizard Training Scheme",
};
const fundingPeriod: FundingPeriod = {
  id: "FP123",
  name: "2019-20",
};

const testSpec: SpecificationSummary = {
  name: "Wizard Training",
  approvalStatus: "",
  description: "",
  fundingPeriod: fundingPeriod,
  fundingStreams: [fundingStream],
  id: "ABC123",
  isSelectedForFunding: true,
  providerVersionId: "",
  templateIds: {},
  dataDefinitionRelationshipIds: [],
  providerSnapshotId: undefined,
  coreProviderVersionUpdates: undefined,
};
const testCalc1: CalculationSearchResult = {
  calculationType: CalculationType.Additional,
  description: undefined,
  fundingStreamId: fundingStream.id,
  id: "54723",
  lastUpdatedDate: new Date(),
  name: "Test Calc 1",
  namespace: "blah-blah",
  status: PublishStatus.Draft,
  specificationId: testSpec.id,
  valueType: ValueType.Currency,
  specificationName: testSpec.name,
  wasTemplateCalculation: false,
  value: 100,
  exceptionMessage: undefined,
};
const testCalc2: CalculationSearchResult = {
  calculationType: CalculationType.Additional,
  description: "Lorem ipsum",
  fundingStreamId: fundingStream.id,
  id: "96363",
  lastUpdatedDate: new Date(),
  name: "Test Calc 2",
  namespace: "blah-blah",
  status: PublishStatus.Updated,
  specificationId: testSpec.id,
  valueType: ValueType.Percentage,
  specificationName: testSpec.name,
  wasTemplateCalculation: false,
  value: 200,
  exceptionMessage: undefined,
};
const testCalc3: CalculationSearchResult = {
  calculationType: CalculationType.Additional,
  description: undefined,
  fundingStreamId: fundingStream.id,
  id: "65472",
  lastUpdatedDate: new Date(),
  name: "Test Calc 3",
  namespace: "blah-blah",
  status: PublishStatus.Approved,
  specificationId: testSpec.id,
  valueType: ValueType.Currency,
  specificationName: testSpec.name,
  wasTemplateCalculation: false,
  value: undefined,
  exceptionMessage: undefined,
};
const withCircularRefErrorsResult: CalculationCircularDependenciesQueryResult = {
  circularReferenceErrors: [
    {
      node: {
        calculationid: testCalc2.id,
        calculationName: testCalc2.name,
        calculationType: testCalc2.calculationType,
        fundingStream: fundingStream.id,
        specificationId: testSpec.id,
      },
      relationships: [],
    },
  ],
  isLoadingCircularDependencies: false,
};

const noCircularRefErrorsResult: CalculationCircularDependenciesQueryResult = {
  circularReferenceErrors: [],
  isLoadingCircularDependencies: false,
};

const fullPermissions: permissionsHook.SpecificationPermissionsResult = {
  isPermissionsFetched: true,
  userId: "123",
  hasPermission: () => true,
  hasMissingPermissions: false,
  isCheckingForPermissions: false,
  missingPermissions: [],
  permissionsDisabled: [],
  permissionsEnabled: [Permission.CanEditCalculations],
};

const noPermissions: permissionsHook.SpecificationPermissionsResult = {
  isPermissionsFetched: true,
  userId: "123",
  hasPermission: () => false,
  hasMissingPermissions: true,
  isCheckingForPermissions: false,
  missingPermissions: [Permission.CanEditCalculations],
  permissionsDisabled: [Permission.CanEditCalculations],
  permissionsEnabled: [],
};

const mockCircularReferenceErrors = jest.spyOn(circularRefErrorsHook, "useCalculationCircularDependencies");
const mockPermissions = jest.spyOn(permissionsHook, "useSpecificationPermissions");

const mockCalculationService = () => {
  const calculationService = jest.requireActual("../../../services/calculationService");
  return {
    ...calculationService,
    searchForCalculationsByProviderService: jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          totalCount: 2,
          totalResults: 2,
          totalErrorResults: 0,
          currentPage: 1,
          lastPage: 1,
          startItemNumber: 0,
          endItemNumber: 0,
          pagerState: {
            displayNumberOfPages: 0,
            previousPage: 0,
            nextPage: 0,
            lastPage: 0,
            pages: [],
            currentPage: 0,
          },
          facets: [],
          calculations: [testCalc1, testCalc2, testCalc3],
        },
      })
    ),
  };
};
const mockSpecificationService = () => {
  const specificationService = jest.requireActual("../../../services/specificationService");
  return {
    ...specificationService,
    getAdditionalCalculationsForSpecificationService: jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          calculations: [testCalc1, testCalc2, testCalc3],
          totalResults: 2,
          totalErrorResults: 0,
          currentPage: 1,
          startItemNumber: 1,
          endItemNumber: 3,
          pagerState: {
            displayNumberOfPages: 2,
            previousPage: null,
            nextPage: null,
            lastPage: 1,
            pages: [1],
            currentPage: 1,
          },
          facets: [],
        },
      })
    ),
  };
};
