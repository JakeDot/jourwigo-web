import { LuaFactory, LuaEngine } from 'wasmoon';
import wherigoApiLua from './sample._cartridge.lua?raw';
import { Cartridge, Zone, Task, Timer, Thing, Player, ZonePoint } from './openwig';

export class WherigoEngine {
  private lua: LuaEngine | null = null;
  private factory: LuaFactory;
  private javaFunctions: Map<string, (...args: any[]) => any> = new Map();
  
  public cartridge: Cartridge | null = null;
  public player: Player = new Player();

  constructor() {
    this.factory = new LuaFactory();
  }

  async init() {
    const lua = await this.factory.createEngine();
    this.lua = lua;
    
    // Register the JavaFunction extension for Jourwigo compatibility
    lua.global.set('JavaFunction', (resource: string, ...args: any[]) => {
      console.log(`Calling JavaFunction: ${resource}`, args);
      const fn = this.javaFunctions.get(resource);
      if (fn) {
        return fn(...args);
      }
      if (resource === 'java.lang.System.out.println') {
        console.log('[LUA System.out]:', ...args);
        return null;
      }
      console.warn(`JavaFunction not found: ${resource}`);
      return null;
    });

    // Expose OpenWIG Java class stubs to Lua
    lua.global.set('cgeo', {
      geocaching: {
        wherigo: {
          openwig: {
            Cartridge: Cartridge,
            Zone: Zone,
            Task: Task,
            Timer: Timer,
            Thing: Thing,
            Player: Player,
            ZonePoint: ZonePoint
          }
        }
      }
    });

    // Basic Wherigo API mock (Lua 5.1 compatible)
    await lua.doString(wherigoApiLua);
  }

  registerJavaFunction(resource: string, fn: (...args: any[]) => any) {
    this.javaFunctions.set(resource, fn);
  }

  async loadCartridge(luaCode: string) {
    if (!this.lua) throw new Error('Engine not initialized');
    this.cartridge = new Cartridge();
    await this.lua.doString(luaCode);
  }

  getCartridgeState() {
    if (!this.lua) return null;
    try {
      const cart = this.lua.global.get('cart');
      const player = this.lua.global.get('Player');
      
      if (!cart) return null;
      
      return {
        name: cart.Name,
        description: cart.Description,
        player: player ? {
          name: player.Name,
          health: player.Health,
          score: player.Score,
          inventoryCount: Array.isArray(player.Inventory) ? player.Inventory.length : 0,
          location: player.ObjectLocation
        } : null,
        zones: Array.isArray(cart.Zones) ? cart.Zones.map((z: any) => ({
          id: z.Id,
          name: z.Name,
          description: z.Description,
          visible: z.Visible,
          active: z.Active,
          state: z.State
        })) : [],
        tasks: Array.isArray(cart.Tasks) ? cart.Tasks.map((t: any) => ({
          id: t.Id,
          name: t.Name,
          description: t.Description,
          status: t.Status
        })) : []
      };
    } catch (e) {
      console.error('Error getting cartridge state:', e);
      return null;
    }
  }

  async runEvent(objectId: number, eventName: string, ...args: any[]) {
    if (!this.lua) throw new Error('Engine not initialized');
    
    // Call the helper function defined in sample._cartridge.lua
    await this.lua.doString(`Wherigo.RunEvent(${objectId}, "${eventName}")`);
  }
}
