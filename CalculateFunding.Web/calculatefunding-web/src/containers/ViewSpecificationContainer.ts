import {connect} from "react-redux";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {AppState} from "../reducers/rootReducer";
import {ViewSpecificationResults} from "../pages/ViewSpecificationResults";
import {getSpecificationSummary} from "../actions/ViewSpecificationActions";

const mapStateToProps = (state: AppState) => ({
    specifications: state.viewSpecification.specification,
    additionalCalculations: state.viewSpecification.additionalCalculations,
    templateCalculations: state.viewSpecification.templateCalculations
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            getSpecificationSummary
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(ViewSpecificationResults);