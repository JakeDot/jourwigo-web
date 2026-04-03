export class EventTable {
  public name: string = "";
  public description: string = "";
  public visible: boolean = true;
  public id: string = Math.random().toString(36).substring(7);
  public events: Map<string, Function> = new Map();

  public callEvent(eventName: string, ...args: any[]) {
    const fn = this.events.get(eventName);
    if (fn) {
      return fn(this, ...args);
    }
  }

  public setEvent(eventName: string, fn: Function) {
    this.events.set(eventName, fn);
  }
}

export class Thing extends EventTable {
  public active: boolean = true;
  public location: ZonePoint | null = null;
}

export class Player extends Thing {
  constructor() {
    super();
    this.name = "Player";
  }
}

export class ZonePoint {
  constructor(public lat: number, public lng: number, public alt: number = 0) {}
}

export class Zone extends EventTable {
  public active: boolean = true;
  public points: ZonePoint[] = [];
  public distanceRange: number = -1;
  public proximityRange: number = -1;
  public showObjects: 'OnEnter' | 'Always' | 'Never' = 'OnEnter';
  public state: 'inside' | 'proximity' | 'distant' = 'distant';

  public isInside(pt: ZonePoint): boolean {
    // Basic ray casting or bounding box check
    return false;
  }
}

export class Task extends EventTable {
  public active: boolean = true;
  public complete: boolean = false;
  public correctState: 'None' | 'Correct' | 'NotCorrect' = 'None';
}

export class Timer extends EventTable {
  public duration: number = 0;
  public type: 'Countdown' | 'Interval' = 'Countdown';
  public active: boolean = false;
  private intervalId: any = null;

  public start() {
    this.active = true;
    this.callEvent('OnStart');
    if (this.type === 'Countdown') {
      this.intervalId = setTimeout(() => this.tick(), this.duration * 1000);
    } else {
      this.intervalId = setInterval(() => this.tick(), this.duration * 1000);
    }
  }

  public stop() {
    this.active = false;
    this.callEvent('OnStop');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      clearTimeout(this.intervalId);
    }
  }

  private tick() {
    this.callEvent('OnTick');
  }
}

export class Cartridge extends EventTable {
  public activity: string = "";
  public startingLocation: ZonePoint | null = null;
  public version: string = "";
  public author: string = "";
  public company: string = "";
  
  public zones: Zone[] = [];
  public tasks: Task[] = [];
  public timers: Timer[] = [];
  public things: Thing[] = [];
}
