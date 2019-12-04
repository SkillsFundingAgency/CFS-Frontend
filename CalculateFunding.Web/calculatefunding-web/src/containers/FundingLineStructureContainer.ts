import {connect} from "react-redux";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {AppState} from "../reducers/rootReducer";
import FundingLineStructurePage from "../pages/FundingLineStructurePage";
import {
    changeFundingLineState,
    getFundingLineStructure,
    getSpecificationById
} from "../actions/FundingLineStructureAction";

const mapStateToProps = (state: AppState) => ({
    fundingLineStructureResult: state.fundingLineStructureState.fundingLineStructureResult,
    specificationResult: state.fundingLineStructureState.specificationResult,
    fundingLineStatusResult: state.fundingLineStructureState.fundingLineStatusResult
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            getFundingLineStructure,
            getSpecificationById,
            changeFundingLineState
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(FundingLineStructurePage);