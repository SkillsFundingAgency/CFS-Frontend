import Dexie from 'dexie';

export class TemplateBuilderDatabase extends Dexie {
    history!: Dexie.Table<ITemplateBuilderHistory, string>;

    constructor() {
        super("TemplateBuilderDatabase");
        this.version(1).stores({
            history: "id, templateJson"
        });
        this.history = this.table("history");
        this.history.mapToClass(TemplateBuilderHistoryItem);
    }
}

export class TemplateBuilderHistoryItem implements ITemplateBuilderHistory {
    id: string;
    templateJson: string;

    constructor(id: string, templateJson: string) {
        this.id = id;
        this.templateJson = templateJson;
    }
}

export interface ITemplateBuilderHistory {
    id: string,
    templateJson: string
}

export const db = new TemplateBuilderDatabase();