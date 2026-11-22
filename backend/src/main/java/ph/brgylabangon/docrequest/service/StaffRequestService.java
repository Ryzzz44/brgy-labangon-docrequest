package ph.brgylabangon.docrequest.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.RequestView;
import ph.brgylabangon.docrequest.dto.StatusUpdateBody;
import ph.brgylabangon.docrequest.entity.DocumentRequest;
import ph.brgylabangon.docrequest.entity.RequestStatus;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.DocumentRequestRepository;
import ph.brgylabangon.docrequest.security.AuthUser;

@Service
public class StaffRequestService {

    private final DocumentRequestRepository requests;
    private final RequestLookupService lookup;
    private final TransactionLogService transactionLog;

    public StaffRequestService(DocumentRequestRepository requests, RequestLookupService lookup,
            TransactionLogService transactionLog) {
        this.requests = requests;
        this.lookup = lookup;
        this.transactionLog = transactionLog;
    }

    /** Every request from every resident, newest first. */
    @Transactional(readOnly = true)
    public List<RequestView> allRequests() {
        return requests.findAllByOrderByCreatedAtDesc().stream().map(RequestView::from).toList();
    }

    /** Staff opened the request, so it is no longer "new". */
    @Transactional
    public RequestView markSeen(AuthUser staff, Long id) {
        DocumentRequest request = lookup.getForUser(id, staff);
        request.setSeenByStaff(true);
        return RequestView.from(request);
    }

    /** Moves a request to its next status. Only the allowed steps are accepted. */
    @Transactional
    public RequestView updateStatus(AuthUser staff, Long id, StatusUpdateBody body) {
        DocumentRequest request = lookup.getForUser(id, staff);
        RequestStatus from = request.getStatus();
        RequestStatus to = body.status();

        if (!isAllowed(from, to)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "A " + from.getLabel() + " request cannot be changed to " + to.getLabel() + ".");
        }

        String remarks = "Status changed to " + to.getLabel();
        if (to == RequestStatus.REJECTED) {
            if (body.reason() == null || body.reason().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "A reason is required to reject a request.");
            }
            request.setRejectionReason(body.reason().trim());
            remarks = "Rejected: " + body.reason().trim();
        }

        request.setStatus(to);
        request.setSeenByStaff(true);
        transactionLog.log(request, staff, to.name(), remarks);
        return RequestView.from(request);
    }

    /**
     * The only allowed steps:
     * PENDING -> PROCESSED or REJECTED
     * PROCESSED -> READY_FOR_PICKUP or REJECTED
     * READY_FOR_PICKUP -> RELEASED
     */
    private boolean isAllowed(RequestStatus from, RequestStatus to) {
        return switch (from) {
            case PENDING -> to == RequestStatus.PROCESSED || to == RequestStatus.REJECTED;
            case PROCESSED -> to == RequestStatus.READY_FOR_PICKUP || to == RequestStatus.REJECTED;
            case READY_FOR_PICKUP -> to == RequestStatus.RELEASED;
            default -> false; // Released, Rejected and Cancelled requests are final
        };
    }
}