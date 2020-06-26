export interface IdentityTokenInfo
{
    access_token: string;
    expires_on: Date;
    provider_name: string;
    user_claims: UserClaim[];
    user_id: string;
    auth_token: string;
}

export interface UserClaim
{
    typ: string;
    val: string;
}