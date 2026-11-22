package ph.brgylabangon.docrequest.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** How strongly an announcement is shown to residents. */
public enum AnnouncementLevel {
    URGENT, IMPORTANT, INFO;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static AnnouncementLevel from(String value) {
        return valueOf(value.trim().toUpperCase());
    }
}
