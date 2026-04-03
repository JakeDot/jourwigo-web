import { EventTable } from './EventTable';

export class ZObject extends EventTable {
  public id: string;
  public name: string = "";
  public description: string = "";
  public visible: boolean = true;
  public active: boolean = true;
  public media: any = null;

  constructor(id?: string) {
    super();
    this.id = id || Math.random().toString(36).substring(7);
    this.table['Id'] = this.id;
    this.table['Name'] = this.name;
    this.table['Description'] = this.description;
    this.table['Visible'] = this.visible;
    this.table['Active'] = this.active;
  }

  public updateFromTable() {
    this.name = this.table['Name'] || this.name;
    this.description = this.table['Description'] || this.description;
    this.visible = this.table['Visible'] !== false;
    this.active = this.table['Active'] !== false;
  }
}
