package ph.brgylabangon.docrequest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Audit log: one row per action on a request (SUBMITTED, UPDATED, CANCELLED, PROCESSED, ...). Table: transaction_history */
@Entity
@Table(name = "transaction_history")
public class TransactionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Many log entries belong to one request (foreign key request_id). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private DocumentRequest request;

    @Column(nullable = false, length = 120)
    private String actorName;

    /** "Resident" or "Staff". */
    @Column(nullable = false, length = 20)
    private String actorRole;

    @Column(nullable = false, length = 30)
    private String actionType;

    @Column(length = 500)
    private String remarks;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    /** Staff removed this resident action from their Notifications page (the log row itself stays). */
    @Column(nullable = false)
    private boolean dismissedByStaff = false;

    @PrePersist
    void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public DocumentRequest getRequest() { return request; }
    public void setRequest(DocumentRequest request) { this.request = request; }
    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public boolean isDismissedByStaff() { return dismissedByStaff; }
    public void setDismissedByStaff(boolean dismissedByStaff) { this.dismissedByStaff = dismissedByStaff; }
}
