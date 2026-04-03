import { LuaFactory, LuaEngine } from 'wasmoon';

export interface WherigoObject {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  active: boolean;
}

export interface Zone extends WherigoObject {
  points: { lat: number; lng: number }[];
  proximityRange: number;
  distanceRange: number;
  state: 'inside' | 'proximity' | 'distant';
}

export class WherigoEngine {
  private lua: LuaEngine | null = null;
  private factory: LuaFactory;
  private javaFunctions: Map<string, (...args: any[]) => any> = new Map();

  constructor() {
    this.factory = new LuaFactory();
  }

  async init() {
    const lua = await this.factory.createEngine();
    this.lua = lua;
    
    // Register the JavaFunction extension
    lua.global.set('JavaFunction', (resource: string, ...args: any[]) => {
      console.log(`Calling JavaFunction: ${resource}`, args);
      const fn = this.javaFunctions.get(resource);
      if (fn) {
        return fn(...args);
      }
      // Fallback for common Java-style patterns if not explicitly registered
      if (resource === 'java.lang.System.out.println') {
        console.log('[LUA System.out]:', ...args);
        return null;
      }
      console.warn(`JavaFunction not found: ${resource}`);
      return null;
    });

    // Basic Wherigo API mock (Lua 5.1 compatible)
    await lua.doString(`
      Wherigo = {}
      Wherigo.INVALID_ID = 0
      
      -- Object base
      function Wherigo.ZObject(obj)
        obj = obj or {}
        obj.Id = obj.Id or math.random(1000000)
        obj.Name = obj.Name or ""
        obj.Description = obj.Description or ""
        obj.Visible = obj.Visible ~= false
        obj.Active = obj.Active ~= false
        return obj
      end

      -- Cartridge
      function Wherigo.ZCartridge(obj)
        local c = Wherigo.ZObject(obj)
        c.AllZObjects = {}
        c.Inventory = {}
        c.Zones = {}
        c.Tasks = {}
        return c
      end

      -- Zone
      function Wherigo.ZZone(cartridge)
        local z = Wherigo.ZObject()
        z.Cartridge = cartridge
        z.Points = {}
        z.ProximityRange = 10
        z.DistanceRange = 50
        z.State = "distant"
        table.insert(cartridge.AllZObjects, z)
        table.insert(cartridge.Zones, z)
        return z
      end

      -- Item
      function Wherigo.ZItem(cartridge)
        local i = Wherigo.ZObject()
        i.Cartridge = cartridge
        table.insert(cartridge.AllZObjects, i)
        return i
      end

      -- Character
      function Wherigo.ZCharacter(cartridge)
        local c = Wherigo.ZObject()
        c.Cartridge = cartridge
        table.insert(cartridge.AllZObjects, c)
        return c
      end

      -- Task
      function Wherigo.ZTask(cartridge)
        local t = Wherigo.ZObject()
        t.Cartridge = cartridge
        t.Status = "not-started"
        table.insert(cartridge.AllZObjects, t)
        table.insert(cartridge.Tasks, t)
        return t
      end

      -- Global helper for JavaFunction style calls
      function RegisterJavaClass(className)
        local parts = {}
        for part in string.gmatch(className, "[^.]+") do
          table.insert(parts, part)
        end
        
        local current = _G
        for i=1, #parts do
          local p = parts[i]
          if i == #parts then
            -- Create a table with a metatable that handles any method call
            current[p] = setmetatable({}, {
              __index = function(t, key)
                return function(...)
                  return JavaFunction(className .. "." .. key, ...)
                end
              end
            })
          else
            current[p] = current[p] or {}
            current = current[p]
          end
        end
      end
    `);
  }

  registerJavaFunction(resource: string, fn: (...args: any[]) => any) {
    this.javaFunctions.set(resource, fn);
  }

  async loadCartridge(luaCode: string) {
    if (!this.lua) throw new Error('Engine not initialized');
    await this.lua.doString(luaCode);
  }

  getCartridgeState() {
    if (!this.lua) return null;
    try {
      const cart = this.lua.global.get('cart');
      if (!cart) return null;
      
      return {
        name: cart.Name,
        description: cart.Description,
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
    
    await this.lua.doString(`
      local objId = ${objectId}
      local eventName = "${eventName}"
      local target = nil
      
      for _, obj in ipairs(cart.AllZObjects) do
        if obj.Id == objId then
          target = obj
          break
        end
      end
      
      if target and target[eventName] then
        target[eventName](target)
      end
    `);
  }
}
