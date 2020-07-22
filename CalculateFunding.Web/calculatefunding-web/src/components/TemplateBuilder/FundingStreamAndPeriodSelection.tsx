import React from "react"
import {FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {ErrorMessage} from "../../types/ErrorMessage";

export interface IFundingStreamAndPeriodSelectionProps {
    hideFundingStreamSelection: boolean,
    selectedFundingStreamId?: string,
    selectedFundingPeriodId?: string,
    fundingStreams: FundingStream[],
    fundingPeriods: FundingPeriod[],
    errors: ErrorMessage[],
    onFundingStreamChange?: (fundingStreamId: string) => void,
    onFundingPeriodChange: (fundingPeriodId: string) => void
}

export const FundingStreamAndPeriodSelection: React.FC<IFundingStreamAndPeriodSelectionProps> =
    ({
         hideFundingStreamSelection,
         selectedFundingStreamId,
         selectedFundingPeriodId,
         fundingStreams,
         fundingPeriods,
         errors,
         onFundingStreamChange,
         onFundingPeriodChange
     }) => {
        const handleFundingStreamChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
            selectedFundingStreamId = e.target.value;
            if (onFundingStreamChange) {
                onFundingStreamChange(e.target.value);
            }
        }

        const handleFundingPeriodChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
            selectedFundingPeriodId = e.target.value;
            onFundingPeriodChange(e.target.value);
        }


        return (
            <div className="govuk-grid-row">
                {!hideFundingStreamSelection &&
                <div className="govuk-grid-column-full">
                    <div className={"govuk-form-group " + 
                        (errors.some(error => error.fieldName === "fundingStreamId") ? 'govuk-form-group--error' : '')}>
                        <label className="govuk-label" htmlFor="fundingStreamId">
                            Select a funding stream
                        </label>
                        {fundingStreams &&
                        <select className="govuk-select" id="fundingStreamId" data-testid="fundingStreamId" name="fundingStreamId"
                                onChange={handleFundingStreamChange}>
                            {fundingStreams.map(stream =>
                                <option key={stream.id} value={stream.id}>{stream.name}</option>)
                            }
                        </select>}
                        {errors.map(error => error.fieldName === "fundingStreamId" &&
                            <span key={error.id} className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error:</span> {error.message}
                            </span>
                        )}
                    </div>
                </div>}
                <div className="govuk-grid-column-full">
                    {fundingStreams && fundingStreams.length > 0 && fundingPeriods &&
                    <div
                        className={"govuk-form-group " + (errors.some(error => error.fieldName === "fundingPeriodId") ? 'govuk-form-group--error' : '')}>
                        <label className="govuk-label" htmlFor="fundingPeriodId">
                            Select a funding period
                        </label>
                        {fundingPeriods.length > 0 &&
                        <select className="govuk-select" id="fundingPeriodId" data-testid="fundingPeriodId" name="fundingPeriodId"
                                onChange={handleFundingPeriodChange}>
                            {fundingPeriods.map(period =>
                                <option key={period.id} value={period.id}>{period.name}</option>)
                            }
                        </select>}
                        {errors.map(error => error.fieldName === "fundingPeriodId" &&
                            <span key={error.id} className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error:</span> {error.message}
                            </span>
                        )}
                    </div>
                    }
                </div>
            </div>
        );
    }