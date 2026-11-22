package ph.brgylabangon.docrequest.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Lifecycle of a document request:
 * PENDING -> PROCESSED -> READY_FOR_PICKUP -> RELEASED, or REJECTED (staff) / CANCELLED (resident).
 * Stored in MySQL as the constant name (e.g. READY_FOR_PICKUP); sent to React as the label ("Ready for Pickup").
 */
public enum RequestStatus {
    PENDING("Pending"),
    PROCESSED("Processed"),
    READY_FOR_PICKUP("Ready for Pickup"),
    RELEASED("Released"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled");

    private final String label;

    RequestStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    /** Accepts either "Ready for Pickup" or "READY_FOR_PICKUP" from the frontend. */
    @JsonCreator
    public static RequestStatus from(String value) {
        for (RequestStatus s : values()) {
            if (s.label.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }

    /** Finished requests can no longer change, and can be archived by the resident. */
    public boolean isFinal() {
        return this == RELEASED || this == REJECTED || this == CANCELLED;
    }
}
