package ph.brgylabangon.docrequest.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ph.brgylabangon.docrequest.dto.HistoryView;
import ph.brgylabangon.docrequest.service.ActivityService;

/** GET /api/staff/history (staff only): the activity log. */
@RestController
public class ActivityController {

    private final ActivityService service;

    public ActivityController(ActivityService service) {
        this.service = service;
    }

    @GetMapping("/api/staff/history")
    public List<HistoryView> history() {
        return service.all();
    }
}