import type { PasswordEntry, PasswordFormKeys } from "@/types";

export function toPasswordEntry(keys: PasswordFormKeys): PasswordEntry {
  return {
    id: keys.id,
    title: keys.title,
    username: keys.username,
    password: keys.password,
    url: keys.url,
    category: keys.category || keys.application || "web",
    favorite: keys.favorite,
  };
}
