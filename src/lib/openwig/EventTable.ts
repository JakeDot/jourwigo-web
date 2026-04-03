export class EventTable {
  public table: Record<string, any> = {};
  public position: any = null;

  public setPosition(pos: any) {
    this.position = pos;
  }

  public hasEvent(eventName: string): boolean {
    return typeof this.table[eventName] === 'function';
  }

  public callEvent(eventName: string, args: any[] = []): any {
    if (this.hasEvent(eventName)) {
      return this.table[eventName](this.table, ...args);
    }
    return null;
  }

  public setItem(key: string, value: any) {
    this.table[key] = value;
  }

  public getItem(key: string): any {
    return this.table[key];
  }
}
