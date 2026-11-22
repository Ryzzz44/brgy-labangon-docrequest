package ph.brgylabangon.docrequest.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ph.brgylabangon.docrequest.dto.EditRequestBody;
import ph.brgylabangon.docrequest.dto.RequestView;
import ph.brgylabangon.docrequest.security.AuthUser;
import ph.brgylabangon.docrequest.service.RequestManagementService;

/**
 * Sanchez's resident endpoints: /api/resident/manage/requests (resident only).
 */
@RestController
@RequestMapping("/api/resident/manage/requests")
public class RequestManagementController {

    private final RequestManagementService service;

    public RequestManagementController(RequestManagementService service) {
        this.service = service;
    }

    @GetMapping
    public List<RequestView> list(@AuthenticationPrincipal AuthUser user,
            @RequestParam(defaultValue = "pending") String view) {
        return service.list(user, view);
    }

    @PutMapping("/{id}")
    public RequestView edit(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
            @Valid @RequestBody EditRequestBody body) {
        return service.edit(user, id, body);
    }

    @PostMapping("/{id}/cancel")
    public RequestView cancel(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return service.cancel(user, id);
    }
}