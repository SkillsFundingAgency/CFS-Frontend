import {connect} from "react-redux";
import ViewFunding from "../pages/ViewFunding";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {
    getAllFundingStreams,
    getPublishedProviderResults,
    getSelectedFundingPeriods,
    getSelectedSpecifications,
    refreshFunding,
    approveFunding,
    publishFunding,
    filterPublishedProviderResults,
    changePageState
} from "../actions/viewFundingAction";
import {AppState} from "../reducers/rootReducer";

const mapStateToProps = (state: AppState) => ({
    specifications: state.viewFundingState.specifications,
    fundingStreams: state.viewFundingState.fundingStreams,
    selectedFundingPeriods: state.viewFundingState.selectedFundingPeriods,
    specificationSelected: state.viewFundingState.specificationSelected,
    publishedProviderResults: state.viewFundingState.publishedProviderResults,
    filterTypes: state.viewFundingState.filterTypes,
    refreshFundingJobId: state.viewFundingState.refreshFundingJobId,
    approveFundingJobId: state.viewFundingState.approveFundingJobId,
    publishFundingJobId: state.viewFundingState.publishFundingJobId,
    pageState: state.viewFundingState.pageState
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            getSelectedSpecifications,
            getAllFundingStreams,
            getSelectedFundingPeriods,
            getPublishedProviderResults,
            filterPublishedProviderResults,
            refreshFunding,
            approveFunding,
            publishFunding,
            changePageState
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(ViewFunding);