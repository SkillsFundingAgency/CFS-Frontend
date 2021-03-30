import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {CalculationError, ObsoleteItemType} from "../../types/Calculations/CalculationError";
import {useCalculationErrors} from "../../hooks/Calculations/useCalculationErrors";
import {renderHook} from "@testing-library/react-hooks";
import {QueryClientProviderTestWrapper} from "./QueryClientProviderTestWrapper";
import {act} from "react-test-renderer";

const mock = new MockAdapter(axios);
const successfulSpecificationId: string = "SPEC123"
const noResultsSpecificationId: string = "NORESULTS";

const mockSuccessfulCalculationErrorsCall: CalculationError[] = [{
    codeReference: "",
    enumValueName: "",
    fundingStreamId: "",
    id: "",
    itemType: ObsoleteItemType.Calculation,
    specificationId: "Spec123",
    additionalCalculations: [
        {
            name: "additional-test-calc-123",
            id: "ADDCALC123"
        }
    ],
    templateCalculations: [
        {
            name: "template-test-calc-123",
            id: "TEMPLATECALC123"
        }
    ],
    title: "obsolete-item-title",
    templateCalculationId: 123
}];

const mockNoCalculationErrorsReturned: CalculationError[] = [];

describe("useCalculationErrors hook ", () => {
    beforeAll(() => {
        mock.onGet(`/api/specification/${successfulSpecificationId}/obsoleteitems`).reply(200, mockSuccessfulCalculationErrorsCall);
        mock.onGet(`/api/specification/${noResultsSpecificationId}/obsoleteitems`).reply(200, mockNoCalculationErrorsReturned);
    });

    afterAll(() => {
        mock.reset();
        jest.clearAllMocks();
    })
    it('should return calculation errors successfully', async () => {
        const {result, waitForValueToChange} =
            renderHook(() => useCalculationErrors(successfulSpecificationId),
                {wrapper: QueryClientProviderTestWrapper});
        await act(async () => {
            await waitForValueToChange(() => result.current.isLoadingCalculationErrors);
        });

        expect(result.current.calculationErrors).toEqual(mockSuccessfulCalculationErrorsCall);
        expect(result.current.isLoadingCalculationErrors).toBe(false);
        expect(result.current.haveErrorCheckingForCalculationErrors).toBe(false);
        expect(result.current.errorCheckingForCalculationErrors).toBeNull();
        expect(result.current.isFetchingCalculationErrors).toBe(false);
        expect(result.current.areCalculationErrorsFetched).toBe(true);
        expect(result.current.calculationErrorCount).toBe(1);
    });

    it('should return no calculation errors successfully', async () => {
        const {result, waitForValueToChange} =
            renderHook(() => useCalculationErrors(noResultsSpecificationId),
                {wrapper: QueryClientProviderTestWrapper});
        await act(async () => {
            await waitForValueToChange(() => result.current.isLoadingCalculationErrors);
        });

        expect(result.current.calculationErrors).toEqual(mockNoCalculationErrorsReturned);
        expect(result.current.isLoadingCalculationErrors).toBe(false);
        expect(result.current.haveErrorCheckingForCalculationErrors).toBe(false);
        expect(result.current.errorCheckingForCalculationErrors).toBeNull();
        expect(result.current.isFetchingCalculationErrors).toBe(false);
        expect(result.current.areCalculationErrorsFetched).toBe(true);
        expect(result.current.calculationErrorCount).toBe(0);
    });
});