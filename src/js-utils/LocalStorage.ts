export class LocalStorageBrowser<T extends Record<string, any>> {
  constructor(private prefix: string = "", defaultData?: T) {
    if (defaultData) {
      Object.keys(defaultData).forEach((key) => {
        const item = window.localStorage.getItem(this.getKey(key));
        if (!item) {
          window.localStorage.setItem(
            this.getKey(key),
            JSON.stringify(defaultData[key])
          );
        }
      });
    }
  }

  private getKey(key: keyof T & string): string {
    return this.prefix + key;
  }

  public set<K extends keyof T & string>(key: K, value: T[K]): void {
    window.localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  public get<K extends keyof T & string>(key: K): T[K] | null {
    const item = window.localStorage.getItem(this.getKey(key));
    return item ? JSON.parse(item) : null;
  }

  public removeItem(key: keyof T & string): void {
    window.localStorage.removeItem(this.getKey(key));
  }

  public clear(): void {
    window.localStorage.clear();
  }
}

export const audioBlobStorage = new LocalStorageBrowser<{
  audioBlobUrl: string | null;
}>("audioBlob_");

export const recentUrlsStorage = new LocalStorageBrowser<{
  recentUrls: string[];
}>("recentUrls_", {
  recentUrls: [] as string[],
});
