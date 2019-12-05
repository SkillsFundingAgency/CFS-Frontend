import React, {useEffect, useState} from 'react';

export function ApproveStatusButton(props: { id: string, status: string, callback: any }) {
    const [currentStatus, setCurrentStatus] = useState({status: props.status, isLoading: false});
    const callback = props.callback;

    useEffect(() => {
        setCurrentStatus({status: props.status, isLoading: false});
    }, [props.status]);

    function submitApprove() {
        setCurrentStatus({status: props.status, isLoading: true});
        return callback(props.id);
    }

    return <div hidden={currentStatus.status === ""}>
        <div className={"govuk-button approval-status-" + props.status}>
            {currentStatus.status}
        </div>
        <div className="approve-button-container" hidden={props.status === "Approved"}>
            <button className="govuk-button"
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
