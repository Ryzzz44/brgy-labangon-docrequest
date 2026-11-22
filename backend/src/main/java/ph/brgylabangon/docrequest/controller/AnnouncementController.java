package ph.brgylabangon.docrequest.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ph.brgylabangon.docrequest.dto.AnnouncementDtos.AnnouncementBody;
import ph.brgylabangon.docrequest.dto.AnnouncementDtos.AnnouncementView;
import ph.brgylabangon.docrequest.security.AuthUser;
import ph.brgylabangon.docrequest.service.AnnouncementService;

/**
 * GET /api/announcements/active anyone (banners for residents and the welcome
 * page)
 * GET /api/staff/announcements staff: all announcements
 * POST /api/staff/announcements staff: post a new one
 * PATCH /api/staff/announcements/{id}/deactivate, DELETE
 * /api/staff/announcements/{id}
 */
@RestController
public class AnnouncementController {

    private final AnnouncementService service;

    public AnnouncementController(AnnouncementService service) {
        this.service = service;
    }

    @GetMapping("/api/announcements/active")
    public List<AnnouncementView> active() {
        return service.active();
    }

    @GetMapping("/api/staff/announcements")
    public List<AnnouncementView> all() {
        return service.all();
    }

    @PostMapping("/api/staff/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementView post(@AuthenticationPrincipal AuthUser staff, @Valid @RequestBody AnnouncementBody body) {
        return service.post(staff, body);
    }

    @PatchMapping("/api/staff/announcements/{id}/deactivate")
    public AnnouncementView deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @DeleteMapping("/api/staff/announcements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}