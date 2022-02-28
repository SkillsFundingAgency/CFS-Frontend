import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

import { updateUserConfirmedSkills } from "../actions/userAction";
import { Main } from "../components/Main";
import { IStoreState } from "../reducers/rootReducer";
import { Section } from "../types/Sections";

export const ConfirmSkills = () => {
  const hasConfirmedSkills: boolean | undefined = useSelector(
    (state: IStoreState) => state.userState && state.userState.hasConfirmedSkills
  );

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
    <Main location={Section.Home}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <span className="govuk-caption-xl govuk-!-margin-bottom-4 govuk-!-margin-left-1">
            Required Knowledge and Skills
          </span>
          <h1 className="govuk-heading-xl govuk-!-margin-left-0">Calculate Funding Service</h1>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <p className="govuk-body">
            Before using the Calculate funding service you must know the general principles on how the
            Education and Skills Funding Agency allocates funding to providers.
          </p>
          <p className="govuk-body">If you have any queries, please contact your line manager.</p>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h3 className="govuk-heading-m">Calculations</h3>
          <p className="govuk-body">
            If you are going to write or approve calculations in CFS you must have skills in Visual Basic
            (VB). These skills are not required however if you do not propose to write or approve
            calculations.
          </p>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h3 className="govuk-heading-m">Data Source Files and Datasets</h3>
          <p className="govuk-body">
            You should only upload a data source file if you are confident that the data it contains, and the
            data schema used are correct and relevant.
          </p>
          <p className="govuk-body">
            You should only map a data source file to a dataset for a specification if you are confident that
            the data schema and data source file version are correct.
          </p>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h3 className="govuk-heading-m">Approving and Releasing Funding</h3>
          <p className="govuk-body">
            You can only approve calculations, specifications and funding in CFS if you have the authority to
            do so.
          </p>
          <p className="govuk-body">
            You can only release funding from CFS to other services for publishing, contracting and payment if
            you have the authority to do so.
          </p>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h3 className="govuk-heading-m">Confirmation</h3>
          <p className="govuk-body">By proceeding you confirm that you:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>have the required skills, knowledge and experience to use the Calculate funding service</li>
            <li>will only approve or release items if you have the authority to do so</li>
          </ul>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <button
            onClick={handleConfirm}
            className="govuk-button govuk-!-margin-right-1"
            data-module="govuk-button"
          >
            Accept and Continue
          </button>
          <a
            href="https://www.gov.uk/"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
          >
            Cancel
          </a>
        </div>
      </div>
    </Main>
  );
};
