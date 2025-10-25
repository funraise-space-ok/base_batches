const storage = {
  async getItem(_key: string): Promise<string | null> {
    return null;
  },
  async setItem(_key: string, _value: string): Promise<void> {
    // noop
  },
  async removeItem(_key: string): Promise<void> {
    // noop
  },
};

export default storage;
export const getItem = storage.getItem;
export const setItem = storage.setItem;
export const removeItem = storage.removeItem;
