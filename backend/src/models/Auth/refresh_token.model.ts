export interface RefreshToken{
    id?: number;
    account_id:string;
    token:string;
    expires_at:Date;
    create_at?:Date;
}