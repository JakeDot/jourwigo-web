package net.jakedot.jourwigo.openwig;

import java.util.ArrayList;
import java.util.List;

public class ZZone extends ZObject {
    public ZCartridge cartridge;
    public List<Object> points = new ArrayList<>();
    public double proximityRange = 10;
    public double distanceRange = 50;
    public String state = "distant";

    public ZZone(ZCartridge cartridge) {
        super();
        this.cartridge = cartridge;
        table.put("Cartridge", cartridge.table);
        table.put("Points", points);
        table.put("ProximityRange", proximityRange);
        table.put("DistanceRange", distanceRange);
        table.put("State", state);
        
        cartridge.addObject(this);
        cartridge.zones.add(this);
    }

    @Override
    public void updateFromTable() {
        super.updateFromTable();
        if (table.containsKey("ProximityRange")) this.proximityRange = ((Number) table.get("ProximityRange")).doubleValue();
        if (table.containsKey("DistanceRange")) this.distanceRange = ((Number) table.get("DistanceRange")).doubleValue();
        if (table.containsKey("State")) this.state = (String) table.get("State");
    }
}
