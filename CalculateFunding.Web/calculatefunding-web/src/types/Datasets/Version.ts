import {Author} from "../Calculations/Author";

export interface Version {
    id: string;
    version: number;
    author: Author;
    date: Date;
}