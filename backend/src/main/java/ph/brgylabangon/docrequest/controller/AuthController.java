package ph.brgylabangon.docrequest.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ph.brgylabangon.docrequest.dto.AuthDtos.*;
import ph.brgylabangon.docrequest.security.AuthUser;
import ph.brgylabangon.docrequest.service.AuthService;

/** Endpoints for creating accounts and logging in. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/register - resident creates an account. */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest body) {
        return authService.register(body);
    }

    /** POST /api/auth/login - resident login. */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest body) {
        return authService.loginResident(body);
    }

    /** POST /api/auth/staff/login - staff login (separate so residents cannot log in as staff). */
    @PostMapping("/staff/login")
    public AuthResponse staffLogin(@Valid @RequestBody LoginRequest body) {
        return authService.loginStaff(body);
    }

    /** GET /api/auth/me - who am I? Used after a page refresh. */
    @GetMapping("/me")
    public AuthResponse me(@AuthenticationPrincipal AuthUser user,
                           @RequestHeader("Authorization") String header) {
        return authService.me(user, header.substring(7));
    }
}
