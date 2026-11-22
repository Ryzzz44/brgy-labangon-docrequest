package ph.brgylabangon.docrequest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** A barangay staff account (e.g. the Barangay Secretary). Table: staff */
@Entity
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    /** Position shown in logs, e.g. "Barangay Secretary". */
    @Column(nullable = false, length = 60)
    private String position;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
