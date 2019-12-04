import React, {useEffect, useState} from 'react';

export function ApproveStatusButton(props: { id: string, status: string, callback: any }) {
    const [currentStatus, setCurrentStatus] = useState({status: props.status, isLoading: false});
    const callback = props.callback;

    useEffect(() => {
        setCurrentStatus({status: props.status, isLoading: false});
    }, [props.status, false]);

    function submitApprove() {
        setCurrentStatus({status: props.status, isLoading: true});
        return callback(props.id);
    }

    return <div hidden={currentStatus.status == ""}>
        <div className={"funding-line-status funding-line-status-" + props.status}>
            {currentStatus.status}
        </div>
        <button type="button"
                hidden={props.status === "Approved"}
                className={"button"}
                aria-label="Approval Status"
                disabled={currentStatus.isLoading}
                onClick={submitApprove}>
            <span hidden={currentStatus.isLoading}>Approve</span>
            <span hidden={!currentStatus.isLoading}>Loading</span>
        </button>
    </div>
}
