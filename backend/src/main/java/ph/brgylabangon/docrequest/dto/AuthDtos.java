package ph.brgylabangon.docrequest.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import ph.brgylabangon.docrequest.entity.Resident;
import ph.brgylabangon.docrequest.entity.Staff;

/** Request and response bodies for /api/auth. Records = small immutable data classes. */
public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 160) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(max = 255) String address,
            @NotBlank @Pattern(regexp = "^09\\d{9}$", message = "must be 11 digits starting with 09") String contactNumber,
            @NotBlank String validIdImage,
            @AssertTrue(message = "you must accept the Privacy Notice and Terms") boolean consent,
            String consentVersion) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    /** What the React app receives after login: the token plus who logged in. */
    public record AuthResponse(String token, String role, Object user) {}

    /** Resident profile sent to the browser (never includes the password hash). */
    public record ResidentProfile(Long id, String fullName, String email, String address,
                                  String contactNumber, String validIdImage, LocalDateTime createdAt) {
        public static ResidentProfile from(Resident r) {
            return new ResidentProfile(r.getId(), r.getFullName(), r.getEmail(), r.getAddress(),
                    r.getContactNumber(), r.getValidIdImage(), r.getCreatedAt());
        }
    }

    public record StaffProfile(Long id, String fullName, String email, String position) {
        public static StaffProfile from(Staff s) {
            return new StaffProfile(s.getId(), s.getFullName(), s.getEmail(), s.getPosition());
        }
    }
}
