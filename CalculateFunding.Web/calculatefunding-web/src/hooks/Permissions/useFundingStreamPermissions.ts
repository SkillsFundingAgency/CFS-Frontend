import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {Permission} from "../../types/Permission";
import {UserPermissions} from "../../types/UserPermissions";

export const useFundingStreamPermissions = (fundingStreamPermissions: FundingStreamPermissions | undefined): Permission[] => {

    function getEnabledPermissions(permissions: UserPermissions): Permission[] {
        return Object
            .keys(permissions)
            .reduce((acc, curr) => {
                if ((<any>permissions)[curr] === true) {
                    const enumValue = Permission[capitalise(curr) as keyof typeof Permission];
                    if (enumValue) {
                        acc.push(enumValue);
                    }
                }
                return acc;
            }, [] as Permission[]);
    }

    const capitalise = (s: string) => {
        return s.charAt(0).toUpperCase() + s.slice(1)
    }
    
    return fundingStreamPermissions ? getEnabledPermissions(fundingStreamPermissions) : [];
}

