import {renderHook} from "@testing-library/react-hooks";
import {act} from "react-test-renderer";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {waitFor} from "@testing-library/dom";

export const testSpec: SpecificationSummary = {
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: {
        id: "FP123",
        name: "2019-20"
    },
    fundingStreams: [{
        name: "FS123",
        id: "Wizard Training Scheme"
    }],
    id: "ABC123",
    isSelectedForFunding: true,
    providerVersionId: ""
};


describe("useSpecificationSummary loads specification", () => {
    const specificationId = "abc123";
    const mock = new MockAdapter(axios);

    beforeAll(() => {
        mock.onGet(`/api/specs/specification-summary-by-id/${specificationId}`).reply(200, testSpec);
    });
    afterAll(() => {
        mock.reset();
        jest.clearAllMocks()
    });

    it("returns specification correctly", async () => {
        const {result, waitForValueToChange} =
            renderHook(() => useSpecificationSummary(specificationId));
        await act(async () => {
            await waitForValueToChange(() => result.current.isLoadingSpecification);
        });
        expect(result.current.specification).toEqual(testSpec);
        expect(result.current.isLoadingSpecification).toBe(false);
        expect(result.current.haveErrorCheckingForSpecification).toBe(false);
        expect(result.current.errorCheckingForSpecification).toBe("");
        expect(result.current.isFetchingSpecification).toBe(false);
        expect(result.current.isSpecificationFetched).toBe(true);
    });
});
