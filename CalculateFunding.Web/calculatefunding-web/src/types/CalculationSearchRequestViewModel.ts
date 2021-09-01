export interface CalculationSearchRequestViewModel {
    specificationId: string,
    calculationType: string,
    status: string,
    pageNumber: number,
    orderBy: string[],
    searchTerm: string,
}
