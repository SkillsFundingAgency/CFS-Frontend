import React from "react";
import {Link} from "react-router-dom";
import {ErrorMessage, ValidationErrors} from "../types/ErrorMessage";

export const MultipleErrorSummary = React.memo(function (props:
                                                             {
                                                                 errors: ErrorMessage[],
                                                                 specificationId?: string
                                                             }) {
    if (props.errors?.length) {
        return (
            <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}
                 data-testid="error-summary">
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                    There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                        {props.errors.map((error, errIdx) =>
                            <li key={errIdx}>
                                {error.description &&
                                <span>{error.description}: </span>
                                }
                                {error.fieldName && <a href={"#" + error.fieldName}
                                                       className="govuk-link govuk-link-red">{error.message}</a>}
                                {!error.fieldName && <span className="govuk-error-message">{error.message}</span>}
                                {error.validationErrors &&
                                <ul className="govuk-list">
                                    {Object.keys(error.validationErrors)
                                        .map((errKey, valErrKeyIdx) =>
                                            errKey === "blobUrl" ?
                                                <BlobValidationError
                                                    key={`${errIdx}-${valErrKeyIdx}`}
                                                    errorFields={error.validationErrors}
                                                />
                                                :
                                                <li key={`${errIdx}-${valErrKeyIdx}`}>
                                                    {error.validationErrors && error.validationErrors[errKey]
                                                        .map((err, errIdx) =>
                                                            (err.includes("#VariationInstallmentLink#")) ?
                                                                <VariationInstallerValidationError
                                                                    key={`validation-error-${errIdx}`}
                                                                    error={err}
                                                                    specificationId={props.specificationId}
                                                                />
                                                                :
                                                                <BasicValidationError
                                                                    key={`validation-error-${errIdx}`}
                                                                    error={err}
                                                                />
                                                        )}
                                                </li>
                                        )}
                                </ul>
                                }
                                {error.suggestion &&
                                error.suggestion
                                }
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        );
    } else {
        return null;
    }
});

const BlobValidationError = (props: { errorFields: ValidationErrors | undefined }) => {
    return (
        <li>
            <span>Please see</span>
            {' '}
            <a href={props.errorFields && props.errorFields["blobUrl"]?.toString()}>
                error report
            </a>
        </li>
    );
};

const VariationInstallerValidationError = (props: { error: string, specificationId: string | undefined }) => {
    const variationSplitter = props.error.split('#VariationInstallmentLink#');
    return (
        <>
            <span>
                {variationSplitter[0]}
                {' '}
                <Link to={`/ViewSpecification/${props.specificationId}`}>
                    Variation Installment Link
                </Link>
                {' '}
                {variationSplitter[1]}
            </span>
            <br/>
        </>
    );
};

const BasicValidationError = (props: { error: string }) => {
    return (
        <>
            <span>
                {props.error}
            </span>
            <br/>
        </>
    );
};