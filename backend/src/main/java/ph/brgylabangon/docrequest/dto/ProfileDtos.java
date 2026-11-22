package ph.brgylabangon.docrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class ProfileDtos {
    private ProfileDtos() {
    }

    /** New profile details. validIdImage empty = keep the current ID. */
    public record ProfileUpdate(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Size(max = 255) String address,
            @NotBlank @Pattern(regexp = "^09\\d{9}$", message = "must be 11 digits starting with 09") String contactNumber,
            String validIdImage) {
    }

    public record PasswordChange(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 72) String newPassword) {
    }
}