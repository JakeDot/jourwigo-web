package net.jakedot.jourwigo.openwig;

import java.util.UUID;

public class ZObject extends EventTable {
    public String id;
    public String name = "";
    public String description = "";
    public boolean visible = true;
    public boolean active = true;
    public Object media = null;

    public ZObject() {
        this(UUID.randomUUID().toString());
    }

    public ZObject(String id) {
        this.id = id;
        table.put("Id", this.id);
        table.put("Name", this.name);
        table.put("Description", this.description);
        table.put("Visible", this.visible);
        table.put("Active", this.active);
    }

    public void updateFromTable() {
        if (table.containsKey("Name")) this.name = (String) table.get("Name");
        if (table.containsKey("Description")) this.description = (String) table.get("Description");
        if (table.containsKey("Visible")) this.visible = (Boolean) table.get("Visible");
        if (table.containsKey("Active")) this.active = (Boolean) table.get("Active");
    }
}
