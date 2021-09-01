import {renderHook} from "@testing-library/react-hooks";
import {useSpecificationResults} from "../../../hooks/Specifications/useSpecificationResults";
import {QueryClientProviderTestWrapper} from "../QueryClientProviderTestWrapper";
import {act} from "react-test-renderer";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {ProviderDataTrackingMode} from "../../../types/Specifications/ProviderDataTrackingMode";

describe("useSpecificationResults hook", () => {
const specificationId = "SPEC123";
const fundingStreamId = "FS123";
const fundingPeriodId = "FP123";
const testSpecResults = [{
    name: "SPEC123",
    id: "SPEC123",
    approvalStatus: "Draft",
    isSelectedForFunding: true,
    description: "",
    providerVersionId: "",
    fundingPeriod: {
        id: "FP123",
        name: "2019-20"
    },
    fundingStreams: [{
        name: "FS123",
        id: "Wizard Training Scheme"
    }],
    providerSnapshotId : 123,
    templateIds: {},
    dataDefinitionRelationshipIds: [],
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual
}]
    const mock = new MockAdapter(axios);

    beforeAll(() => {
        mock.onGet(`/api/specs/specifications-by-fundingperiod-and-fundingstream/${fundingPeriodId}/${fundingStreamId}/with-results`)
            .reply(200,
                testSpecResults)
    })

    afterAll(() =>{
        mock.reset();
        jest.clearAllMocks();
    })

    it('should return true for specification results', async () => {
        const {
            result,
            waitForValueToChange
        } = renderHook(() => useSpecificationResults(specificationId, fundingStreamId, fundingPeriodId, err => {
            }),
            {
                wrapper: QueryClientProviderTestWrapper
            });

        await act(async () => {
            await waitForValueToChange(() => result.current.isLoadingSpecificationResults);
        });

        expect(result.current.isLoadingSpecificationResults).toBe(false);
        expect(result.current.specificationHasCalculationResults).toBe(true);

    });
})
