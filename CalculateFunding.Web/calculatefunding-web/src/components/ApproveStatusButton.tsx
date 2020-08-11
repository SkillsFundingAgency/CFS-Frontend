import React, {useEffect, useState} from 'react';

export function ApproveStatusButton(props: {id: string, status: string, callback: any}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(false);
    }, [props.status]);

    function submitApprove() {
        setIsLoading(true);
        props.callback(props.id);
    }

    return <div>
        <strong className="govuk-tag right-align">
            {props.status}
        </strong>
        {props && props.status && props.status !== "Approved" &&
        <div className="approve-button-container">
            <button className="govuk-button govuk-!-margin-right-1"
                    type="button"
                    aria-label="Approval Status"
                    disabled={isLoading}
                    onClick={submitApprove}>
                <span hidden={isLoading}>Approve</span>
                <span hidden={!isLoading}>Loading</span>
            </button>
        </div>}
    </div>
}
