package ph.brgylabangon.docrequest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request bodies for "Forgot password". */
public final class PasswordResetDtos {
    private PasswordResetDtos() {}

    /** POST /api/auth/forgot-password */
    public record ForgotPasswordBody(@NotBlank @Email String email) {}

    /** POST /api/auth/reset-password (token comes from the link in the email) */
    public record ResetPasswordBody(
            @NotBlank @Size(max = 100) String token,
            @NotBlank @Size(min = 8, max = 72) String newPassword) {}
}
