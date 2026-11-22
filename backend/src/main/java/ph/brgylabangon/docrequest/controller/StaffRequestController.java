package ph.brgylabangon.docrequest.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ph.brgylabangon.docrequest.dto.RequestView;
import ph.brgylabangon.docrequest.dto.StatusUpdateBody;
import ph.brgylabangon.docrequest.security.AuthUser;
import ph.brgylabangon.docrequest.service.StaffRequestService;

/**
 * Staff-only endpoints (SecurityConfig allows /api/staff/** for ROLE_STAFF
 * only).
 */
@RestController
@RequestMapping("/api/staff/requests")
public class StaffRequestController {

    private final StaffRequestService service;

    public StaffRequestController(StaffRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<RequestView> allRequests() {
        return service.allRequests();
    }

    @PatchMapping("/{id}/seen")
    public RequestView markSeen(@AuthenticationPrincipal AuthUser staff, @PathVariable Long id) {
        return service.markSeen(staff, id);
    }

    @PatchMapping("/{id}/status")
    public RequestView updateStatus(@AuthenticationPrincipal AuthUser staff, @PathVariable Long id,
            @Valid @RequestBody StatusUpdateBody body) {
        return service.updateStatus(staff, id, body);
    }
}