import { ZObject } from './ZObject';
import { ZCartridge } from './ZCartridge';

export class ZZone extends ZObject {
  public cartridge: ZCartridge;
  public points: { lat: number; lng: number }[] = [];
  public proximityRange: number = 10;
  public distanceRange: number = 50;
  public state: 'inside' | 'proximity' | 'distant' = 'distant';

  constructor(cartridge: ZCartridge) {
    super();
    this.cartridge = cartridge;
    this.table['Cartridge'] = cartridge.table;
    this.table['Points'] = this.points;
    this.table['ProximityRange'] = this.proximityRange;
    this.table['DistanceRange'] = this.distanceRange;
    this.table['State'] = this.state;
    
    cartridge.addObject(this);
    cartridge.zones.push(this);
  }

  public updateFromTable() {
    super.updateFromTable();
    this.proximityRange = this.table['ProximityRange'] || this.proximityRange;
    this.distanceRange = this.table['DistanceRange'] || this.distanceRange;
    this.state = this.table['State'] || this.state;
  }
}
