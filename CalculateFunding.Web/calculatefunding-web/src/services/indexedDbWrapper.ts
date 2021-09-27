import { db, ITemplateBuilderHistory } from "../types/TemplateBuilder/TemplateBuilderDatabase";

export const open = async () => {
  await db.open();
};

export const clear = async (storageKey: string) => {
  await db.history.where("storageKey").equals(storageKey).delete();
};

export const deleteDb = async () => {
  await db.delete();
};

export const update = async (item: ITemplateBuilderHistory) => {
  const itemToUpdate = await db.history
    .filter((i) => i.key === item.key && i.storageKey === item.storageKey)
    .first();
  if (itemToUpdate) item.id = itemToUpdate.id;
  await db.history.put(item);
};

export const deleteItem = async (key: string) => {
  await db.history.where("key").equals(key).delete();
};

export const findByKey = async (key: string) => {
  return await db.history.where("key").equals(key).first();
};
