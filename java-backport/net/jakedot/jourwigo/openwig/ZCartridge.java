package net.jakedot.jourwigo.openwig;

import java.util.ArrayList;
import java.util.List;

public class ZCartridge extends ZObject {
    public List<ZObject> allZObjects = new ArrayList<>();
    public List<ZZone> zones = new ArrayList<>();
    public List<Object> tasks = new ArrayList<>();
    public List<Object> inventory = new ArrayList<>();

    public ZCartridge() {
        super();
        table.put("AllZObjects", allZObjects);
        table.put("Zones", zones);
        table.put("Tasks", tasks);
        table.put("Inventory", inventory);
    }

    public void addObject(ZObject obj) {
        allZObjects.add(obj);
    }
}
