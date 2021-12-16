import { renderHook } from "@testing-library/react-hooks";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react-test-renderer";

import { useSpecificationResults } from "../../../hooks/Specifications/useSpecificationResults";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { QueryClientProviderTestWrapper } from "../QueryClientProviderTestWrapper";

describe("useSpecificationResults hook", () => {
  const specificationId = "SPEC123";
  const fundingStreamId = "FS123";
  const fundingPeriodId = "FP123";
  const testSpecResults = [
    {
      name: "SPEC123",
      id: "SPEC123",
      approvalStatus: "Draft",
      isSelectedForFunding: true,
      description: "",
      providerVersionId: "",
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
      providerSnapshotId: 123,
      templateIds: {},
      dataDefinitionRelationshipIds: [],
      coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    },
  ];
  const mock = new MockAdapter(axios);

  beforeAll(() => {
    mock
      .onGet(
        `/api/specs/specifications-by-fundingperiod-and-fundingstream/${fundingPeriodId}/${fundingStreamId}/with-results`
      )
      .reply(200, testSpecResults);
  });

  afterAll(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  it("should return true for specification results", async () => {
    const { result, waitForValueToChange } = renderHook(
      () => useSpecificationResults(specificationId, fundingStreamId, fundingPeriodId, () => Promise.resolve()),
      {
        wrapper: QueryClientProviderTestWrapper,
      }
    );

    await act(async () => {
      await waitForValueToChange(() => result.current.isLoadingSpecificationResults);
    });

    expect(result.current.isLoadingSpecificationResults).toBe(false);
    expect(result.current.specificationHasCalculationResults).toBe(true);
  });
});
