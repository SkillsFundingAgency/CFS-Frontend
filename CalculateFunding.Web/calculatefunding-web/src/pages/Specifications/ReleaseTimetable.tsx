import React, {useEffect, useState} from "react";
import {DateInput} from "../../components/DateInput";
import {TimeInput} from "../../components/TimeInput";
import {DateTime} from "luxon";
import {getReleaseTimetableForSpecificationService, saveReleaseTimetableForSpecificationService} from "../../services/publishService";
import {ReleaseTimetableSummary, ReleaseTimetableViewModel} from "../../types/ReleaseTimetableSummary";
import {SaveReleaseTimetableViewModel} from "../../types/SaveReleaseTimetableViewModel";
import {LoadingStatus} from "../../components/LoadingStatus";
import {ConfirmationPanel} from "../../components/ConfirmationPanel";

export interface ReleaseTimetableProps {
    specificationId: string,
    addErrorMessage: (errorMessage: any, description?: string, fieldName?: string) => void,
    clearErrorMessages: (fieldNames?: string[]) => void,
}

export function ReleaseTimetable({specificationId, addErrorMessage, clearErrorMessages}: ReleaseTimetableProps) {
    const [navisionDate, setNavisionDate] = useState<Date>(new Date(0));
    const [releaseDate, setReleaseDate] = useState<Date>(new Date(0));
    const [navisionTime, setNavisionTime] = useState<string>("");
    const [releaseTime, setReleaseTime] = useState<string>("");
    const [canTimetableBeUpdated, setCanTimetableBeUpdated] = useState(true);
    const [isSavingReleaseTimetable, setIsSavingReleaseTimetable] = useState<boolean>(false);
    const [saveSuccessful, setSaveSuccessful] = useState<boolean>(false);

    let saveReleaseTimetable: SaveReleaseTimetableViewModel;

    useEffect(() => {
        async function getReleaseTimetable() {
            try {
                const response = await getReleaseTimetableForSpecificationService(specificationId);
                let result = response.data as ReleaseTimetableSummary;
                if (result.content.earliestPaymentAvailableDate != null) {
                    setReleaseDate(DateTime.fromISO(result.content.earliestPaymentAvailableDate).toJSDate());
                }
                if (result.content.externalPublicationDate != null) {
                    setNavisionDate(DateTime.fromISO(result.content.externalPublicationDate).toJSDate());
                }
            }
            catch (error) {
                addErrorMessage(error.message, undefined, "release-timetable");
            }
        }

        getReleaseTimetable();
    }, [specificationId]);

    useEffect(() => {
        if (navisionDate === new Date(0) || releaseDate === new Date(0)) {
            setCanTimetableBeUpdated(false);
        } else {
            setCanTimetableBeUpdated(true);
        }
    }, [releaseDate, navisionDate]);

    function updateNavisionDate(e: Date) {
        setNavisionDate(e);
    }

    function updateReleaseDate(e: Date) {
        setReleaseDate(e);
    }

    function updateNavisionTime(e: string) {
        if (e === "") {
            setCanTimetableBeUpdated(false);
        }
        setNavisionTime(e);
    }

    function updateReleaseTime(e: string) {
        if (e === "") {
            setCanTimetableBeUpdated(false);
        }
        setReleaseTime(e);
    }

    function updateDateWithTime(date: Date, time: string) {
        let year = `${date.getFullYear()}`
        let monthNumber = date.getMonth() + 1;
        let month = `${monthNumber < 10 ? "0" + monthNumber : monthNumber}`;
        let day = `${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;
        let hours = `T${parseInt(time) < 10 ? "0" + parseInt(time) : parseInt(time)}:00:00.000`;

        let newDate = DateTime.fromISO(`${year}-${month}-${day}${hours}`)
        return newDate.toJSDate();
    }

    async function confirmChanges() {
        if (!navisionDate || !releaseDate || navisionTime.length === 0 || releaseTime.length === 0) {
            addErrorMessage("Please a enter release date and time for funding and statement", undefined, "release-timetable");
            window.scrollTo(0, 0);
            return;
        }

        setSaveSuccessful(false);
        setCanTimetableBeUpdated(false);
        setIsSavingReleaseTimetable(true);

        let navisionDateTime = updateDateWithTime(navisionDate, navisionTime);
        let releaseDateTime = updateDateWithTime(releaseDate, releaseTime);
        saveReleaseTimetable = {
            specificationId: specificationId,
            statementDate: navisionDateTime,
            fundingDate: releaseDateTime
        };

        try {
            const response = await saveReleaseTimetableForSpecificationService(saveReleaseTimetable);
            const result = response.data as ReleaseTimetableViewModel;
            setReleaseDate(DateTime.fromISO(result.earliestPaymentAvailableDate).toJSDate());
            setNavisionDate(DateTime.fromISO(result.externalPublicationDate).toJSDate());
            setSaveSuccessful(true);
            clearErrorMessages(["release-timetable"]);
        } catch (error) {
            addErrorMessage(error.message, undefined, "release-timetable");
            window.scrollTo(0, 0);
        } finally {
            setIsSavingReleaseTimetable(false);
        }
    }

    return <div>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
                <h2 id="release-timetable-title" className="govuk-heading-l">Release timetable</h2>
            </div>
        </div>
        <LoadingStatus title={"Saving Release Timetable"} description={"Please wait whilst we save your changes"} hidden={!isSavingReleaseTimetable} />
        <ConfirmationPanel title={"Save successful"} body={"Your changes have been saved"} hidden={!saveSuccessful} />
        <div className={"govuk-form-group"} hidden={isSavingReleaseTimetable}>
            <fieldset className="govuk-fieldset" role="group"
                aria-describedby="passport-issued-hint">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h3 id="business-central-title" className="govuk-heading-m">Release date of funding to Business Central?</h3>
                </legend>
                <span id="business-central-date-hint" className="govuk-hint">
                    Set the date and time that the statement will be published externally for this funding stream.
                                            <br />
                                            For example, 12 11 2019
                                        </span>
            </fieldset>
        </div>
        <div className="govuk-form-group govuk-!-margin-bottom-9" hidden={isSavingReleaseTimetable}>
            <DateInput date={navisionDate} callback={updateNavisionDate} />
        </div>
        <div className="govuk-form-group govuk-!-margin-bottom-9" hidden={isSavingReleaseTimetable}>
            <TimeInput time={navisionDate.getFullYear() != DateTime.fromMillis(0).year ? DateTime.fromJSDate(navisionDate).toFormat("HH") : ""} callback={updateNavisionTime} />
        </div>
        <div className="govuk-form-group" hidden={isSavingReleaseTimetable}>
            <fieldset className="govuk-fieldset" role="group">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h3 id="statement-providers-title" className="govuk-heading-m">Release date of statement to providers?</h3>
                </legend>
                <span id="release-date-hint" className="govuk-hint">
                    Set the date and time that the statement will be published externally for this funding stream. <br />
                                            For example, 12 11 2019</span>
            </fieldset>
        </div>
        <div className="govuk-form-group govuk-!-margin-bottom-9" hidden={isSavingReleaseTimetable}>
            <DateInput date={releaseDate} callback={updateReleaseDate} />
        </div>
        <div className="govuk-form-group govuk-!-margin-bottom-9" hidden={isSavingReleaseTimetable}>
            <TimeInput time={releaseDate.getFullYear() != DateTime.fromMillis(0).year ? DateTime.fromJSDate(releaseDate).toFormat("HH") : ""} callback={updateReleaseTime} />
        </div>
        <div className="govuk-form-group" hidden={isSavingReleaseTimetable}>
            <button className="govuk-button" onClick={confirmChanges} disabled={!canTimetableBeUpdated}>Confirm changes
            </button>
        </div>
    </div>
}