package ph.brgylabangon.docrequest.controller;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ph.brgylabangon.docrequest.dto.PasswordResetDtos.ForgotPasswordBody;
import ph.brgylabangon.docrequest.dto.PasswordResetDtos.ResetPasswordBody;
import ph.brgylabangon.docrequest.service.PasswordResetService;

/** Salado's "Forgot password" endpoints (anyone may call them; see SecurityConfig). */
@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService service;

    public PasswordResetController(PasswordResetService service) {
        this.service = service;
    }

    /** POST /api/auth/forgot-password { email } -> emails a reset link if the account exists. */
    @PostMapping("/forgot-password")
    public Map<String, String> forgot(@Valid @RequestBody ForgotPasswordBody body) {
        service.requestReset(body.email());
        return Map.of("message", "If that email is registered, a reset link has been sent. Check your inbox and spam folder.");
    }

    /** POST /api/auth/reset-password { token, newPassword } */
    @PostMapping("/reset-password")
    public Map<String, String> reset(@Valid @RequestBody ResetPasswordBody body) {
        service.resetPassword(body.token(), body.newPassword());
        return Map.of("message", "Your password has been changed. You can now log in.");
    }
}
