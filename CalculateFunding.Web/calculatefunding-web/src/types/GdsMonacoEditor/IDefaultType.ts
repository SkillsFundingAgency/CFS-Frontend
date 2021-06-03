import {IDefaultMemberTypeContainer} from "./IDefaultMemberTypeContainer";

export interface IDefaultType {
    label: string;

    description?: string;

    items: IDefaultMemberTypeContainer;

    isObsolete: boolean;
}