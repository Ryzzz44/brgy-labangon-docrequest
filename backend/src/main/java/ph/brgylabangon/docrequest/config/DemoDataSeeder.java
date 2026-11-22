package ph.brgylabangon.docrequest.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.entity.*;
import ph.brgylabangon.docrequest.repository.*;
import ph.brgylabangon.docrequest.security.AuthUser;

/**
 * Demo mode only (app.demo-mode=true). Runs after DataSeeder.
 * 1. Makes sure a demo resident exists (juan@demo.local / Demo1234!).
 * 2. If there are no requests yet, adds sample requests in every status, with history,
 *    plus one announcement, so every member's page has data even if a groupmate's part is missing.
 */
@Component
@Order(2)
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    public static final String DEMO_EMAIL = "juan@demo.local";
    public static final String DEMO_PASSWORD = "Demo1234!";

    /** Tiny placeholder picture used as the demo resident's "valid ID". */
    private static final String SAMPLE_ID_IMAGE = "data:image/svg+xml;base64,"
            + java.util.Base64.getEncoder().encodeToString((
            "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'>"
            + "<rect width='320' height='200' rx='16' fill='#EEF0FF'/>"
            + "<text x='24' y='48' font-family='sans-serif' font-size='18' fill='#4D55F5'>SAMPLE ID</text>"
            + "<text x='24' y='90' font-family='sans-serif' font-size='16' fill='#334155'>Juan Dela Cruz</text>"
            + "<text x='24' y='118' font-family='sans-serif' font-size='13' fill='#64748B'>Brgy. Labangon, Cebu City</text>"
            + "</svg>").getBytes(java.nio.charset.StandardCharsets.UTF_8));

    private final DemoAccounts demo;
    private final ResidentRepository residents;
    private final StaffRepository staffRepo;
    private final DocumentRequestRepository requests;
    private final TransactionHistoryRepository history;
    private final AnnouncementRepository announcements;
    private final PasswordEncoder encoder;

    public DemoDataSeeder(DemoAccounts demo, ResidentRepository residents, StaffRepository staffRepo,
                          DocumentRequestRepository requests, TransactionHistoryRepository history,
                          AnnouncementRepository announcements, PasswordEncoder encoder) {
        this.demo = demo;
        this.residents = residents;
        this.staffRepo = staffRepo;
        this.requests = requests;
        this.history = history;
        this.announcements = announcements;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!demo.isEnabled()) return;

        Resident juan = residents.findByEmailIgnoreCase(DEMO_EMAIL).orElseGet(() -> {
            Resident r = new Resident();
            r.setFullName("Juan Dela Cruz");
            r.setEmail(DEMO_EMAIL);
            r.setPasswordHash(encoder.encode(DEMO_PASSWORD));
            r.setAddress("123 Sample St., Purok 1, Labangon, Cebu City");
            r.setContactNumber("09123456789");
            r.setValidIdImage(SAMPLE_ID_IMAGE);
            r.setConsentVersion("demo");
            return residents.save(r);
        });
        Staff staff = staffRepo.findAll().get(0); // created by DataSeeder

        demo.setResident(new AuthUser(juan.getId(), "RESIDENT", juan.getEmail(), juan.getFullName()));
        demo.setStaff(new AuthUser(staff.getId(), "STAFF", staff.getEmail(), staff.getFullName()));
        log.warn("DEMO MODE IS ON: pages work without login. Set DEMO_MODE=false for real use.");

        if (requests.count() > 0) return;

        sample(juan, staff, "BR-2026-000101", "Barangay Clearance", "Employment requirement", RequestStatus.PENDING, null, false);
        sample(juan, staff, "BR-2026-000102", "Certificate of Indigency", "Medical assistance", RequestStatus.PENDING, null, false);
        sample(juan, staff, "BR-2026-000103", "Certificate of Residency", "School enrollment", RequestStatus.PROCESSED, null, false);
        sample(juan, staff, "BR-2026-000104", "First Time Job Seeker Certificate", "First job application", RequestStatus.READY_FOR_PICKUP, null, false);
        sample(juan, staff, "BR-2026-000105", "Barangay Clearance", "Bank account opening", RequestStatus.RELEASED, null, false);
        sample(juan, staff, "BR-2026-000106", "Certificate of Residency", "Scholarship", RequestStatus.REJECTED,
                "The uploaded ID is not readable. Please submit a clearer photo.", false);
        sample(juan, staff, "BR-2026-000107", "Certificate of Indigency", "Burial assistance", RequestStatus.CANCELLED, null, true);

        Announcement a = new Announcement();
        a.setTitle("Office hours");
        a.setMessage("The barangay hall is open Monday to Friday, 8:00 AM to 5:00 PM. Bring a valid ID when claiming documents.");
        a.setLevel(AnnouncementLevel.IMPORTANT);
        a.setCreatedBy(staff);
        announcements.save(a);
        log.info("Added demo requests and an announcement.");
    }

    private void sample(Resident res, Staff staff, String ref, String type, String purpose,
                        RequestStatus status, String reason, boolean archived) {
        DocumentRequest r = new DocumentRequest();
        r.setReferenceNumber(ref);
        r.setResident(res);
        r.setDocumentType(type);
        r.setPurpose(purpose);
        r.setValidIdImage(res.getValidIdImage());
        r.setStatus(status);
        r.setRejectionReason(reason);
        r.setResidentSeenStatus(RequestStatus.PENDING);   // anything past Pending shows as a new notification
        r.setSeenByStaff(status != RequestStatus.PENDING);
        r.setArchivedByResident(archived);
        requests.save(r);

        log(r, res.getFullName(), "Resident", "SUBMITTED", "Submitted request for " + type);
        if (status == RequestStatus.CANCELLED) {
            log(r, res.getFullName(), "Resident", "CANCELLED", "Resident cancelled request " + ref);
        } else if (status != RequestStatus.PENDING) {
            log(r, staff.getFullName(), "Staff", status.name(), status == RequestStatus.REJECTED ? reason : "Status changed to " + status.getLabel());
        }
    }

    private void log(DocumentRequest r, String actor, String role, String action, String remarks) {
        TransactionHistory h = new TransactionHistory();
        h.setRequest(r);
        h.setActorName(actor);
        h.setActorRole(role);
        h.setActionType(action);
        h.setRemarks(remarks);
        history.save(h);
    }
}
