import React, {useEffect, useState} from 'react';

export function ApproveStatusButton(props: { id: string, status: string, callback: any }) {
    const [currentStatus, setCurrentStatus] = useState({status: props.status, isLoading: false});
    const callback = props.callback;

    useEffect(() => {
        setCurrentStatus({status: props.status, isLoading: false});
    }, [props.status]);

    function submitApprove() {
        setCurrentStatus({status: props.status, isLoading: true});
        callback(props.id);
    }

    return <div hidden={currentStatus.status === ""}>
        <strong className="govuk-tag right-align">
            {currentStatus.status}
        </strong>
        <div className="approve-button-container" hidden={props.status === "Approved"}>
            <button className="govuk-button govuk-!-margin-right-1"
                    type="button"
                    hidden={props.status === "Approved"}
                    aria-label="Approval Status"
                    disabled={currentStatus.isLoading}
                    onClick={submitApprove}>
                <span hidden={currentStatus.isLoading}>Approve</span>
                <span hidden={!currentStatus.isLoading}>Loading</span>
            </button>
        </div>
    </div>
}
