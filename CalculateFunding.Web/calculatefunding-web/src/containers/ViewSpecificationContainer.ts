import {connect} from "react-redux";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {AppState} from "../reducers/rootReducer";
import {ViewSpecificationResults} from "../pages/ViewSpecificationResults";
import {getSpecificationSummary} from "../actions/ViewSpecificationResultsActions";

const mapStateToProps = (state: AppState) => ({
    specifications: state.viewSpecificationResults.specification,
    additionalCalculations: state.viewSpecificationResults.additionalCalculations,
    templateCalculations: state.viewSpecificationResults.templateCalculations
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            getSpecificationSummary
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(ViewSpecificationResults);