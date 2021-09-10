import { Author } from "../Calculations/Author";

export interface DatasetVersionSummary {
  id: string;
  version: number;
  author: Author;
  date: Date;
}
