-- Custom Lua Logic
function zone1:OnEnter()
  com.jourwigo.UI.Toast("You have entered the Ancient Portal!")
  com.jourwigo.System.Log("User entered zone1")
  
  -- Direct JavaFunction call
  JavaFunction("com.jourwigo.Audio.PlaySound", "portal_hum.mp3")
end

function zone1:OnExit()
  com.jourwigo.UI.Toast("The portal's energy fades away.")
end

com.jourwigo.System.Log("Cartridge initialized successfully!")
