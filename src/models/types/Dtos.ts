// General type for setting forbidden fields
export type SetForbiddenFields<T, K extends keyof T> = Omit<T, K> & Partial<Record<K, never>>;
// General type for DTOs (never fields should be required)
export type DTO<T> = {
    [P in keyof T as T[P] extends never ? never : P]: T[P];
} & {
    [P in keyof T as T[P] extends never ? P : never]-?: T[P];
};