﻿import {useSelector} from "react-redux";
import {UserPermission} from "../../types/UserPermission";
import {IStoreState} from "../../reducers/rootReducer";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";

export const usePermittedFundingStreams = (forPermission: UserPermission): string[] => {
    const permissions: FundingStreamPermissions[] = useSelector((state: IStoreState) => {
        return state.userState.fundingStreamPermissions
    });

    const permittedStreams = (requiredPermission: keyof typeof UserPermission): string[] => {
        return permissions
            .filter(perm => perm[requiredPermission as keyof FundingStreamPermissions] === true)
            .map(item => item.fundingStreamId);
    }

    return permittedStreams(forPermission.toString() as keyof typeof UserPermission);
}