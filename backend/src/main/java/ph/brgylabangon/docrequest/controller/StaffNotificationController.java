package ph.brgylabangon.docrequest.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ph.brgylabangon.docrequest.dto.HistoryView;
import ph.brgylabangon.docrequest.service.StaffNotificationService;

/** Rafanan's staff notifications: /api/staff/notifications (staff only, see SecurityConfig). */
@RestController
@RequestMapping("/api/staff/notifications")
public class StaffNotificationController {

    private final StaffNotificationService service;

    public StaffNotificationController(StaffNotificationService service) {
        this.service = service;
    }

    /** GET /api/staff/notifications -> latest resident actions, newest first */
    @GetMapping
    public List<HistoryView> list() {
        return service.list();
    }

    /** DELETE /api/staff/notifications/{id} -> X button */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void dismiss(@PathVariable Long id) {
        service.dismiss(id);
    }

    /** DELETE /api/staff/notifications -> "Delete all" */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void dismissAll() {
        service.dismissAll();
    }
}
