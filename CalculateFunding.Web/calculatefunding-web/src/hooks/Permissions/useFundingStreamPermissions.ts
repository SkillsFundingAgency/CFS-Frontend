import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { Permission } from "../../types/Permission";
import { UserPermissions } from "../../types/UserPermissions";

export function getEnabledPermissions(permissions: UserPermissions | FundingStreamPermissions): Permission[] {
  return Object.keys(permissions).reduce((acc, curr) => {
    if ((<any>permissions)[curr] === true) {
      const enumValue = Permission[capitalise(curr) as keyof typeof Permission];
      if (enumValue) {
        acc.push(enumValue);
      }
    }
    return acc;
  }, [] as Permission[]);
}

export function getDisabledPermissions(
  permissions: UserPermissions | FundingStreamPermissions
): Permission[] {
  return Object.keys(permissions).reduce((acc, curr) => {
    if ((<any>permissions)[curr] === false) {
      const enumValue = Permission[capitalise(curr) as keyof typeof Permission];
      if (enumValue) {
        acc.push(enumValue);
      }
    }
    return acc;
  }, [] as Permission[]);
}

function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string
): keyof T | null {
  const keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);
  return keys.length > 0 ? keys[0] : null;
}

export function applyPermission(
  fundingStreamPermissions: FundingStreamPermissions,
  permission: Permission,
  isEnabled: boolean
) {
  const permissionKey = getEnumKeyByEnumValue(Permission, permission);
  if (!permissionKey) throw Error(`Permission '${permission}' does not exist`);

  const updated: any = fundingStreamPermissions;
  updated[decapitalise(permissionKey)] = isEnabled;

  return updated;
}

export function applyEnabledPermissions(
  fundingStreamPermissions: FundingStreamPermissions,
  enabledPermissions: Permission[]
) {
  const allPerms: Permission[] = Object.values(Permission).map((x) => x.toString()) as Permission[];
  let result = fundingStreamPermissions;

  allPerms.forEach((perm) => {
    result = applyPermission(fundingStreamPermissions, perm, enabledPermissions.includes(perm));
  });

  return result;
}

export const capitalise = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const decapitalise = (s: string) => {
  return s.charAt(0).toLowerCase() + s.slice(1);
};

export const useFundingStreamPermissions = (
  fundingStreamPermissions: FundingStreamPermissions | undefined
): Permission[] => {
  return fundingStreamPermissions ? getEnabledPermissions(fundingStreamPermissions) : [];
};
