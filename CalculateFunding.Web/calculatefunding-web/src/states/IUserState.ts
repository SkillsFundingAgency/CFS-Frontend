import { FundingStreamPermissions } from "../types/FundingStreamPermissions";


export interface IUserState {
    isLoggedIn: boolean,
    userName: string,
    fundingStreamPermissions: FundingStreamPermissions[],
    hasConfirmedSkills: boolean | undefined
}