export interface Profiletotal {
  year: number;
  typeValue: string;
  occurrence: number;
  value: number;
  isPaid: boolean;
}

export interface Version {
  version: number;
  date: Date;
  profiletotals: Profiletotal[];
}

export interface ProfileArchiveViewModel {
  name: string;
  version: Version;
}
