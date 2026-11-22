package ph.brgylabangon.docrequest.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ph.brgylabangon.docrequest.dto.RequestView;
import ph.brgylabangon.docrequest.dto.SubmitRequestBody;
import ph.brgylabangon.docrequest.security.AuthUser;
import ph.brgylabangon.docrequest.service.ResidentRequestService;

@RestController
@RequestMapping("/api/resident/requests")
public class ResidentRequestController {

    private final ResidentRequestService service;

    public ResidentRequestController(ResidentRequestService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RequestView submit(@AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody SubmitRequestBody body) {
        return service.submit(user, body);
    }

    @GetMapping
    public List<RequestView> myRequests(@AuthenticationPrincipal AuthUser user) {
        return service.myRequests(user);
    }
}