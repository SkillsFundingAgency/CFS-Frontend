import {Section} from "../../types/Sections";
import React, {useMemo, useState} from "react";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {Main} from "../../components/Main";
import {WarningText} from "../../components/WarningText";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useHistory} from "react-router";

enum AdminSelection {
    None = "None",
    ByIndividual = "ByIndividual",
    ByFundingStream = "ByFundingStream"
}

export function Admin() {
    const permissions: FundingStreamPermissions[] = useSelector((state: IStoreState) => state.userState.fundingStreamPermissions);
    document.title = "Administer permissions";
    const [adminSelection, setAdminSelection] = useState<AdminSelection>(AdminSelection.None);
    const fundingStreams = useMemo(() => permissions && permissions
        .filter(fs => fs.canAdministerFundingStream)
        .map(fs => ({
            id: fs.fundingStreamId,
            name: fs.fundingStreamName
        })), [permissions]);
    const {errors, addError, clearErrorMessages} = useErrors();
    const history = useHistory();

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        clearErrorMessages();
        setAdminSelection(e.target.value === "by-individual-user" ? AdminSelection.ByIndividual : AdminSelection.ByFundingStream);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        clearErrorMessages();

        switch (adminSelection) {
            case AdminSelection.ByIndividual:
                history.push(`/Permissions/Individual`);
                break;
            case AdminSelection.ByFundingStream:
                history.push(`/Permissions/FundingStream`);
                break;
            default:
                addError({error: "Select how you would like to view user permissions"})
                break;
        }
    }

    return (
        <Main location={Section.Home}>
            <MultipleErrorSummary errors={errors}/>

            {permissions && fundingStreams && fundingStreams.length === 0 &&
            <WarningText
                text="You don't have any admin permissions"
                className="govuk-!-margin-top-4"
            />
            }
            <section>
                <form id="view-permissions-type"
                      onSubmit={handleSubmit}
                      noValidate={true}
                      data-validate="permissions">
                    <fieldset className="govuk-fieldset" aria-describedby="view-permissions-heading">
                        <div className="govuk-form-group">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 id="view-permissions-heading" className="govuk-fieldset__heading">
                                    Would you like to view user permissions for
                                </h1>
                            </legend>
                            <div className="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input"
                                           id="individual-user"
                                           name="view-user-permissions-for"
                                           onChange={onChange}
                                           type="radio"
                                           value="by-individual-user"
                                           aria-describedby="individual-user-hint"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="individual-user">
                                        An individual user
                                    </label>
                                    <div id="individual-user-hint" className="govuk-hint govuk-radios__hint">
                                        Assign and view permissions for users of Calculate funding service.
                                    </div>
                                </div>
                                <div className="govuk-radios__divider">or</div>
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input"
                                           id="funding-stream"
                                           name="view-user-permissions-for"
                                           onChange={onChange}
                                           type="radio"
                                           value="by-funding-stream"
                                           aria-describedby="funding-stream-hint"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="funding-stream">
                                        A funding stream
                                    </label>
                                    <div id="funding-stream-hint" className="govuk-hint govuk-radios__hint">
                                        View all users permissions for a funding stream in CSV format.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit"
                                className="govuk-button"
                                data-module="govuk-button">
                            Continue
                        </button>
                    </fieldset>
                </form>
            </section>
        </Main>
    );
}
