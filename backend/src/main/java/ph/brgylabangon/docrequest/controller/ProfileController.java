package ph.brgylabangon.docrequest.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ph.brgylabangon.docrequest.dto.AuthDtos.ResidentProfile;
import ph.brgylabangon.docrequest.dto.ProfileDtos.PasswordChange;
import ph.brgylabangon.docrequest.dto.ProfileDtos.ProfileUpdate;
import ph.brgylabangon.docrequest.security.AuthUser;
import ph.brgylabangon.docrequest.service.ProfileService;

/**
 * GET/PUT /api/resident/profile and PUT /api/resident/password (resident only).
 */
@RestController
@RequestMapping("/api/resident")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping("/profile")
    public ResidentProfile get(@AuthenticationPrincipal AuthUser user) {
        return service.get(user);
    }

    @PutMapping("/profile")
    public ResidentProfile update(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody ProfileUpdate body) {
        return service.update(user, body);
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody PasswordChange body) {
        service.changePassword(user, body);
    }
}