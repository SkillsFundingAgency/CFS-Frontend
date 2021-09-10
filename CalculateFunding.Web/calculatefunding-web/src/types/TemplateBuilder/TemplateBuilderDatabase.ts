import Dexie from "dexie";

export class TemplateBuilderDatabase extends Dexie {
  history!: Dexie.Table<ITemplateBuilderHistory, number>;

  constructor() {
    super("TemplateBuilderDatabase");
    this.version(1).stores({
      history: "++id, key, storageKey, templateJson",
    });
    this.history = this.table("history");
    this.history.mapToClass(TemplateBuilderHistoryItem);
  }
}

export class TemplateBuilderHistoryItem implements ITemplateBuilderHistory {
  id?: number;
  key: string;
  storageKey: string;
  templateJson: string;

  constructor(id: number, key: string, storageKey: string, templateJson: string) {
    this.id = id;
    this.key = key;
    this.storageKey = storageKey;
    this.templateJson = templateJson;
  }
}

export interface ITemplateBuilderHistory {
  id?: number;
  key: string;
  storageKey: string;
  templateJson: string;
}

export const db = new TemplateBuilderDatabase();
