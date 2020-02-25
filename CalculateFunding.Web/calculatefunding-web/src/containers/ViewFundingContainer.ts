import {connect} from "react-redux";
import ViewFunding from "../pages/ViewFunding";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {
    getAllFundingStreams,
    getPublishedProviderResults,
    getLatestRefreshDate,
    getSelectedFundingPeriods,
    getSelectedSpecifications,
    getUserPermissions,
    refreshFunding,
    approveFunding,
    releaseFunding,
    filterPublishedProviderResults,
    changePageState, getLatestJobForSpecification, getLocalAuthorities
} from "../actions/viewFundingAction";
import {AppState} from "../reducers/rootReducer";

const mapStateToProps = (state: AppState) => ({
    specifications: state.viewFundingState.specifications,
    fundingStreams: state.viewFundingState.fundingStreams,
    selectedFundingPeriods: state.viewFundingState.selectedFundingPeriods,
    specificationSelected: state.viewFundingState.specificationSelected,
    publishedProviderResults: state.viewFundingState.publishedProviderResults,
    latestRefreshDateResults: state.viewFundingState.latestRefreshDateResults,
    effectiveSpecificationPermission: state.viewFundingState.userPermission,
    filterTypes: state.viewFundingState.filterTypes,
    refreshFundingJobId: state.viewFundingState.refreshFundingJobId,
    approveFundingJobId: state.viewFundingState.approveFundingJobId,
    releaseFundingJobId: state.viewFundingState.releaseFundingJobId,
    pageState: state.viewFundingState.pageState,
    latestJob: state.viewFundingState.latestJob,
    localAuthorities: state.viewFundingState.localAuthorities
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            getSelectedSpecifications,
            getAllFundingStreams,
            getSelectedFundingPeriods,
            getPublishedProviderResults,
            getLatestRefreshDate,
            getUserPermissions,
            getLatestJobForSpecification,
            filterPublishedProviderResults,
            refreshFunding,
            approveFunding,
            releaseFunding,
            changePageState,
            getLocalAuthorities
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(ViewFunding);