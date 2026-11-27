package ph.brgylabangon.docrequest.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import ph.brgylabangon.docrequest.service.LiveUpdateService;

/**
 * GET /api/live: a connection that stays open. The server sends "requests" or "announcements"
 * whenever one of them changes, so every open page updates right away (see LiveUpdateService).
 * Open to everyone: the messages contain no personal data, and the pages still need a login to load the data itself.
 */
@RestController
public class LiveUpdateController {

    private final LiveUpdateService live;

    public LiveUpdateController(LiveUpdateService live) {
        this.live = live;
    }

    @GetMapping(value = "/api/live", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect() {
        return live.connect();
    }
}
