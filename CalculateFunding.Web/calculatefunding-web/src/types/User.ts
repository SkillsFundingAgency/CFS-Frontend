import { UserPermissions } from "./UserPermissions";

export interface User extends UserPermissions {
  username: string;
  hasConfirmedSkills: boolean;
}
