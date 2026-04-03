package net.jakedot.jourwigo.openwig;

import java.util.HashMap;
import java.util.Map;

public class EventTable {
    public Map<String, Object> table = new HashMap<>();
    public Object position = null;

    public void setPosition(Object pos) {
        this.position = pos;
    }

    public boolean hasEvent(String eventName) {
        // In a real Kahlua environment, this checks if the table contains a LuaClosure
        return table.containsKey(eventName) && table.get(eventName) != null;
    }

    public Object callEvent(String eventName, Object[] args) {
        if (hasEvent(eventName)) {
            // In Kahlua, this would invoke the Lua closure.
            // This is a stub for the backport.
            System.out.println("Calling event: " + eventName);
        }
        return null;
    }

    public void setItem(String key, Object value) {
        table.put(key, value);
    }

    public Object getItem(String key) {
        return table.get(key);
    }
}
