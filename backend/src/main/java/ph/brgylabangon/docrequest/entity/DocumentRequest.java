package ph.brgylabangon.docrequest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** One document request filed by a resident. Table: document_request */
@Entity
@Table(name = "document_request")
public class DocumentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-friendly tracking number shown to residents, e.g. BR-2026-004512. */
    @Column(nullable = false, unique = true, length = 30)
    private String referenceNumber;

    /** Many requests belong to one resident (foreign key resident_id). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resident_id", nullable = false)
    private Resident resident;

    @Column(nullable = false, length = 80)
    private String documentType;

    @Column(nullable = false, length = 500)
    private String purpose;

    /** ID used for this request (defaults to the resident's registration ID). */
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String validIdImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.PENDING;

    /** Required when status is REJECTED. */
    @Column(length = 500)
    private String rejectionReason;

    /** Last status the resident has seen; differs from status = unread notification. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus residentSeenStatus = RequestStatus.PENDING;

    /** Status whose notification the resident deleted (X / Delete all). A newer status shows up again. */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RequestStatus notifClearedStatus;

    /** False when the resident created or changed it and staff have not opened it yet. */
    @Column(nullable = false)
    private boolean seenByStaff = false;

    @Column(nullable = false)
    private boolean archivedByResident = false;

    /** Soft delete: hidden from the resident but kept for staff records and reports. */
    @Column(nullable = false)
    private boolean deletedByResident = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** When the status last changed. Shown on notifications (updatedAt also changes when a request is only read or archived). */
    private LocalDateTime statusChangedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (statusChangedAt == null) statusChangedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public Resident getResident() { return resident; }
    public void setResident(Resident resident) { this.resident = resident; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getValidIdImage() { return validIdImage; }
    public void setValidIdImage(String validIdImage) { this.validIdImage = validIdImage; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) {
        if (status != this.status) statusChangedAt = LocalDateTime.now();
        this.status = status;
    }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public RequestStatus getResidentSeenStatus() { return residentSeenStatus; }
    public void setResidentSeenStatus(RequestStatus residentSeenStatus) { this.residentSeenStatus = residentSeenStatus; }
    public RequestStatus getNotifClearedStatus() { return notifClearedStatus; }
    public void setNotifClearedStatus(RequestStatus notifClearedStatus) { this.notifClearedStatus = notifClearedStatus; }
    public boolean isSeenByStaff() { return seenByStaff; }
    public void setSeenByStaff(boolean seenByStaff) { this.seenByStaff = seenByStaff; }
    public boolean isArchivedByResident() { return archivedByResident; }
    public void setArchivedByResident(boolean archivedByResident) { this.archivedByResident = archivedByResident; }
    public boolean isDeletedByResident() { return deletedByResident; }
    public void setDeletedByResident(boolean deletedByResident) { this.deletedByResident = deletedByResident; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getStatusChangedAt() { return statusChangedAt; }
}
