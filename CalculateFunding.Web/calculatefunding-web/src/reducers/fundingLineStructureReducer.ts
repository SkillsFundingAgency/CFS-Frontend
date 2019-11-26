import {IFundingLineStructureState} from "../states/IFundingLineStructureState";
import {FundingLineStructureAction, FundingLineStructureActionTypes} from "../actions/FundingLineStructureAction";

const initialState: IFundingLineStructureState = {
    specificationResult: {
        name: "",
        id: "",
        templateIds: {
            PSG: ""
        },
        publishedResultsRefreshedAt: null,
        providerVersionId: "",
        lastCalculationUpdatedAt: "",
        fundingStreams: [],
        fundingPeriod: {
            id: "",
            name: ""
        },
        isSelectedForFunding: false,
        description: "",
        approvalStatus: ""
    },
    fundingLineStructureResult: []
};

export function reduceFundingLineStructureState(state: IFundingLineStructureState = initialState, action: FundingLineStructureAction): IFundingLineStructureState {
    switch (action.type) {
        case FundingLineStructureActionTypes.GET_FUNDINGLINESTRUCTURE:
            return {...state, fundingLineStructureResult: action.payload};
        case FundingLineStructureActionTypes.GET_SPECIFICATIONBYID:
            return {...state, specificationResult: action.payload};
        default:
            return state;
    }
}