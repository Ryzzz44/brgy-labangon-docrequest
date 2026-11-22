package ph.brgylabangon.docrequest.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.EditRequestBody;
import ph.brgylabangon.docrequest.dto.RequestView;
import ph.brgylabangon.docrequest.entity.DocumentRequest;
import ph.brgylabangon.docrequest.entity.RequestStatus;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.DocumentRequestRepository;
import ph.brgylabangon.docrequest.security.AuthUser;

@Service
public class RequestManagementService {

    private static final List<String> DOCUMENT_TYPES = List.of(
            "Barangay Clearance", "Certificate of Residency",
            "Certificate of Indigency", "First Time Job Seeker Certificate");

    private final DocumentRequestRepository requests;
    private final RequestLookupService lookup;
    private final TransactionLogService transactionLog;

    public RequestManagementService(DocumentRequestRepository requests, RequestLookupService lookup,
            TransactionLogService transactionLog) {
        this.requests = requests;
        this.lookup = lookup;
        this.transactionLog = transactionLog;
    }

    /** view = "pending" (can still be edited or cancelled) or "archived". */
    @Transactional(readOnly = true)
    public List<RequestView> list(AuthUser user, String view) {
        return requests.findByResidentIdAndDeletedByResidentFalseOrderByCreatedAtDesc(user.id()).stream()
                .filter(r -> "archived".equals(view)
                        ? r.isArchivedByResident()
                        : r.getStatus() == RequestStatus.PENDING)
                .map(RequestView::from)
                .toList();
    }

    /** UC-04: change a request, only while it is still Pending. */
    @Transactional
    public RequestView edit(AuthUser user, Long id, EditRequestBody body) {
        DocumentRequest request = lookup.getForUser(id, user);
        requirePending(request, "edited");
        if (!DOCUMENT_TYPES.contains(body.documentType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown document type.");
        }
        request.setDocumentType(body.documentType());
        request.setPurpose(body.purpose().trim());
        if (body.validIdImage() != null && body.validIdImage().startsWith("data:image/")) {
            request.setValidIdImage(body.validIdImage());
        }
        request.setSeenByStaff(false); // staff should look at it again
        transactionLog.log(request, user, "UPDATED", "Resident updated the request details.");
        return RequestView.from(request);
    }

    /** UC-03: cancel a request, only while it is still Pending. */
    @Transactional
    public RequestView cancel(AuthUser user, Long id) {
        DocumentRequest request = lookup.getForUser(id, user);
        requirePending(request, "cancelled");
        request.setStatus(RequestStatus.CANCELLED);
        request.setResidentSeenStatus(RequestStatus.CANCELLED); // the resident did it, so no notification
        transactionLog.log(request, user, "CANCELLED", "Resident cancelled request " + request.getReferenceNumber());
        return RequestView.from(request);
    }

    private void requirePending(DocumentRequest request, String action) {
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Only pending requests can be " + action + ". This one is " + request.getStatus().getLabel() + ".");
        }
    }
}