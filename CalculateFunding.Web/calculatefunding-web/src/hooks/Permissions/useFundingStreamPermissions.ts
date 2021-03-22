import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {Permission} from "../../types/Permission";
import {UserPermissions} from "../../types/UserPermissions";


export function getEnabledPermissions(permissions: UserPermissions): Permission[] {
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

export function getDisabledPermissions(permissions: UserPermissions): Permission[] {
    return Object
        .keys(permissions)
        .reduce((acc, curr) => {
            if ((<any>permissions)[curr] === false) {
                const enumValue = Permission[capitalise(curr) as keyof typeof Permission];
                if (enumValue) {
                    acc.push(enumValue);
                }
            }
            return acc;
        }, [] as Permission[]);
}

export const capitalise = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const useFundingStreamPermissions = (fundingStreamPermissions: FundingStreamPermissions | undefined): Permission[] => {
    
    return fundingStreamPermissions ? getEnabledPermissions(fundingStreamPermissions) : [];
}

