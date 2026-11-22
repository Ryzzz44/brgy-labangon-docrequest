package ph.brgylabangon.docrequest.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
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

    @PatchMapping("/{id}/archive")
    public RequestView archive(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return service.setArchived(user, id, true);
    }

    @PatchMapping("/{id}/unarchive")
    public RequestView unarchive(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return service.setArchived(user, id, false);
    }

    /** DELETE /api/resident/manage/requests/archived -> "Delete all" in the archive */
    @DeleteMapping("/archived")
    public Map<String, Integer> deleteAllArchived(@AuthenticationPrincipal AuthUser user) {
        return Map.of("deleted", service.deleteAllArchived(user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        service.delete(user, id);
    }
}