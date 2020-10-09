import {Author} from "../Calculations/Author";

export interface DatasetVersion {
    version: number;
    author: Author;
    date: Date;
}