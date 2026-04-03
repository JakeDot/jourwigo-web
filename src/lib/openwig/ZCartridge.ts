import { ZObject } from './ZObject';

export class ZCartridge extends ZObject {
  public allZObjects: ZObject[] = [];
  public zones: any[] = [];
  public tasks: any[] = [];
  public inventory: any[] = [];

  constructor() {
    super();
    this.table['AllZObjects'] = this.allZObjects;
    this.table['Zones'] = this.zones;
    this.table['Tasks'] = this.tasks;
    this.table['Inventory'] = this.inventory;
  }

  public addObject(obj: ZObject) {
    this.allZObjects.push(obj);
  }
}
