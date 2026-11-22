package ph.brgylabangon.docrequest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ph.brgylabangon.docrequest.security.AuthUser;

/**
 * Demo mode support (app.demo-mode=true): remembers which resident and staff account
 * to act as when a page calls the API without logging in. Filled in by DemoDataSeeder.
 * This lets every member present their own pages even if the login page is not available.
 */
@Component
public class DemoAccounts {

    private final boolean enabled;
    private volatile AuthUser resident;
    private volatile AuthUser staff;

    public DemoAccounts(@Value("${app.demo-mode}") boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEnabled() { return enabled; }
    public AuthUser getResident() { return resident; }
    public void setResident(AuthUser resident) { this.resident = resident; }
    public AuthUser getStaff() { return staff; }
    public void setStaff(AuthUser staff) { this.staff = staff; }
}
