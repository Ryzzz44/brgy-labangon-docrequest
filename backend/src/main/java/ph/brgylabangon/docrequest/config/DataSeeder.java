package ph.brgylabangon.docrequest.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ph.brgylabangon.docrequest.entity.Staff;
import ph.brgylabangon.docrequest.repository.StaffRepository;

/**
 * On startup: if there is no staff account yet, create one from app.seed.* in application.properties.
 * Residents register themselves; staff accounts are never created from the public website.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final String name;
    private final String email;
    private final String password;

    public DataSeeder(StaffRepository staffRepository, PasswordEncoder passwordEncoder,
                      @Value("${app.seed.staff-name}") String name,
                      @Value("${app.seed.staff-email}") String email,
                      @Value("${app.seed.staff-password}") String password) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (staffRepository.count() > 0) return;
        Staff staff = new Staff();
        staff.setFullName(name);
        staff.setEmail(email.toLowerCase());
        staff.setPasswordHash(passwordEncoder.encode(password));
        staff.setPosition("Barangay Secretary");
        staffRepository.save(staff);
        log.info("Created first staff account: {} (change the password after first login)", email);
    }
}
