import {UserPermissions} from "./UserPermissions";

export interface EffectiveSpecificationPermission extends UserPermissions {
    specificationId: string;
}