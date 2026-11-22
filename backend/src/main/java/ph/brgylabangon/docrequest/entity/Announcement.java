package ph.brgylabangon.docrequest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** A notice posted by staff and shown as a banner to every resident. Table: announcement */
@Entity
@Table(name = "announcement")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnnouncementLevel level = AnnouncementLevel.IMPORTANT;

    @Column(nullable = false)
    private boolean active = true;

    /** Many announcements are posted by one staff member (foreign key staff_id). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Null = shown until removed. */
    private LocalDateTime expiresAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public AnnouncementLevel getLevel() { return level; }
    public void setLevel(AnnouncementLevel level) { this.level = level; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Staff getCreatedBy() { return createdBy; }
    public void setCreatedBy(Staff createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
