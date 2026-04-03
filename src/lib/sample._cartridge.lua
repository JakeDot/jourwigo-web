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
  c.ObjectLocation = { latitude = 0, longitude = 0, altitude = 0 }
  c.Health = 100
  c.Score = 0
  c.Inventory = {}
  if cartridge then
    table.insert(cartridge.AllZObjects, c)
  end
  return c
end

-- Global Player
Player = Wherigo.ZCharacter(nil)
Player.Name = "Player"

-- Task
function Wherigo.ZTask(cartridge)
  local t = Wherigo.ZObject()
  t.Cartridge = cartridge
  t.Status = "not-started"
  table.insert(cartridge.AllZObjects, t)
  table.insert(cartridge.Tasks, t)
  return t
end

-- Timer
function Wherigo.ZTimer(cartridge)
  local t = Wherigo.ZObject()
  t.Cartridge = cartridge
  t.Duration = 0
  t.Type = "Countdown"
  table.insert(cartridge.AllZObjects, t)
  return t
end

-- Input
function Wherigo.ZInput(cartridge)
  local i = Wherigo.ZObject()
  i.Cartridge = cartridge
  i.InputType = "Text"
  i.Text = "Enter value:"
  table.insert(cartridge.AllZObjects, i)
  return i
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
