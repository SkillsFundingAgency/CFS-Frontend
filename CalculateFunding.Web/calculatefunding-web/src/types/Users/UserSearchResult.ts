export interface UserSearchResult {
  users: UserSearchResultItem[] | undefined;
}
export interface UserSearchResultItem {
  id: string;
  name: string;
  username: string;
}
