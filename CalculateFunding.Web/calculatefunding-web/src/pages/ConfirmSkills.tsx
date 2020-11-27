import React, {useEffect} from "react";
import {Header} from "../components/Header";
import {Section} from "../types/Sections";
import {Footer} from "../components/Footer";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router";
import {updateUserConfirmedSkills} from "../actions/userAction";
import {IStoreState} from "../reducers/rootReducer";

export const ConfirmSkills = () => {
    const hasConfirmedSkills: boolean | undefined = useSelector((state: IStoreState) => state.userState && state.userState.hasConfirmedSkills);

    const dispatch = useDispatch();
    const history = useHistory();

    const handleConfirm = async () => {
        await dispatch(await updateUserConfirmedSkills(true));
    };

    useEffect(() => {
        if (hasConfirmedSkills) {
            history.go(0);
        }
    }, [hasConfirmedSkills]);

    return (
        <div>
            <Header location={Section.Home}/>
            <div className="govuk-width-container">
                <main className="govuk-main-wrapper govuk-main-wrapper--l" id="main-content" role="main">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <span className="govuk-caption-xl govuk-!-margin-bottom-4 govuk-!-margin-left-1">Required Knowledge and Skills</span>
                            <h1 className="govuk-heading-xl govuk-!-margin-left-0">Calculate Funding Service</h1>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <p className="govuk-body">You must have skills in Visual Basic (VB).</p>
                            <p className="govuk-body">You must know the general principles on how the Education and Skills Funding Agency
                                allocates funding to providers. This includes schools, academies, apprenticeships and other educational and
                                training establishments.</p>
                            <p className="govuk-body">If you have any queries, please contact your line manager.</p>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h3 className="govuk-heading-m">Specifications</h3>
                            <p className="govuk-body">A specification contain the required calculations for funding. This includes the required
                                calculations, providers in scope and outputs needed.</p>
                            <p className="govuk-body">A specification is used for a set funding period and one funding streams.</p>
                            <p className="govuk-body">The template calculation links will automatically appear as links for you to populate with
                                the calculation information. These will be displayed to providers on their funding statement. Funding
                                calculations will also be displayed on funding statements.</p>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h3 className="govuk-heading-m">Calculations</h3>
                            <p className="govuk-body">You must have a schema set-up in CFS for your specification and have the required data
                                source files uploaded and mapped to work for the calculations. You will use coding language, VB, to create
                                or edit template calculations and additional calculations.</p>
                            <p className="govuk-body">Calculate funding uses ‘Intellisense’ which will help you input functions and links to
                                datasets. This means that you can choose the core provider datasets when creating or editing your
                                specification</p>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h3 className="govuk-heading-m">Data Source Files and Datasets</h3>
                            <p className="govuk-body">You should only upload a data source file if you are confident that the data it contains,
                                and the data schema used are correct and relevant.</p>
                            <p className="govuk-body">You should only map a data source file to a dataset for a specification if you are
                                confident that the data schema and data source file version are correct.</p>
                            <p className="govuk-body">If you require a specific set of provider data,
                                you can <a target="_blank" className="govuk-link"
                                           href="https://dfe.service-now.com"
                                           rel="noopener noreferrer">
                                    raise a request from the DfE helpdesk</a> and it will appear as an option in ‘Core
                                provider data’ option when creating or editing a Specification.</p>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h3 className="govuk-heading-m">Approving and Releasing Funding</h3>
                            <p className="govuk-body">Only if you have the authority to do so you can approve:</p>
                            <ul className="govuk-list govuk-list--bullet">
                                <li>specifications</li>
                                <li>calculations</li>
                                <li>funding</li>
                            </ul>
                            <p className="govuk-body">You may also have the required authority in order to release this funding.</p>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h3 className="govuk-heading-m">Confirmation</h3>
                            <p className="govuk-body">By proceeding you confirm that you:</p>
                            <ul className="govuk-list govuk-list--bullet">
                                <li>have the required skills, knowledge and experience to use the Calculate funding service</li>
                                <li>will only approve or publish items if you have the authority to do so</li>
                            </ul>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <button onClick={handleConfirm}
                                    className="govuk-button govuk-!-margin-right-1" data-module="govuk-button">
                                Accept and Continue
                            </button>
                            <a href="https://www.gov.uk/"
                               className="govuk-button govuk-button--secondary"
                               data-module="govuk-button">
                                Cancel
                            </a>
                        </div>
                    </div>
                </main>
            </div>
            <Footer/>
        </div>
    );
};