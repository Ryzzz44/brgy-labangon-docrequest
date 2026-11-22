package ph.brgylabangon.docrequest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** A registered resident. Table: resident */
@Entity
@Table(name = "resident")
public class Resident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    /** BCrypt hash, never the real password. */
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, length = 20)
    private String contactNumber;

    /** Proof of residency image, stored as a compressed data URL (data:image/jpeg;base64,...). */
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String validIdImage;

    /** Which version of the Privacy Notice / Terms the resident agreed to (Data Privacy Act). */
    @Column(length = 20)
    private String consentVersion;

    private LocalDateTime consentAt;

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
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getValidIdImage() { return validIdImage; }
    public void setValidIdImage(String validIdImage) { this.validIdImage = validIdImage; }
    public String getConsentVersion() { return consentVersion; }
    public void setConsentVersion(String consentVersion) { this.consentVersion = consentVersion; }
    public LocalDateTime getConsentAt() { return consentAt; }
    public void setConsentAt(LocalDateTime consentAt) { this.consentAt = consentAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
