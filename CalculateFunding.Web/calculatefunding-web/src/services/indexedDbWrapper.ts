import {db, ITemplateBuilderHistory} from "../types/TemplateBuilder/TemplateBuilderDatabase";

export const open = async () => {
  await db.open();
}

export const clear = async (key: string) => {
  await db.history.filter(h => h.id.includes(key)).delete();
}

export const deleteDb = async () => {
  db.delete();
}

export const update = async (item: ITemplateBuilderHistory) => {
  await db.history.put(item);
}

export const deleteItem = async (item: string) => {
  await db.history.delete(item);
}

export const findById = async (id: string) => {
  return await db.history.where("id").equals(id).first();
}