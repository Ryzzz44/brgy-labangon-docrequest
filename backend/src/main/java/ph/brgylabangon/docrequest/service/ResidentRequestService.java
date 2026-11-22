package ph.brgylabangon.docrequest.service;

import java.security.SecureRandom;
import java.time.Year;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.RequestView;
import ph.brgylabangon.docrequest.dto.SubmitRequestBody;
import ph.brgylabangon.docrequest.entity.DocumentRequest;
import ph.brgylabangon.docrequest.entity.Resident;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.DocumentRequestRepository;
import ph.brgylabangon.docrequest.repository.ResidentRepository;
import ph.brgylabangon.docrequest.security.AuthUser;

@Service
public class ResidentRequestService {

    private static final List<String> DOCUMENT_TYPES = List.of(
            "Barangay Clearance", "Certificate of Residency",
            "Certificate of Indigency", "First Time Job Seeker Certificate");

    private final DocumentRequestRepository requests;
    private final ResidentRepository residents;
    private final TransactionLogService transactionLog;
    private final RequestLookupService lookup;
    private final SecureRandom random = new SecureRandom();

    public ResidentRequestService(DocumentRequestRepository requests, ResidentRepository residents,
            TransactionLogService transactionLog, RequestLookupService lookup) {
        this.requests = requests;
        this.residents = residents;
        this.transactionLog = transactionLog;
        this.lookup = lookup;
    }

    @Transactional
    public RequestView submit(AuthUser user, SubmitRequestBody body) {
        if (!DOCUMENT_TYPES.contains(body.documentType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown document type.");
        }
        Resident resident = residents.findById(user.id())
                .orElseThrow(() -> ApiException.notFound("Resident"));

        String image = (body.validIdImage() == null || body.validIdImage().isBlank())
                ? resident.getValidIdImage()
                : body.validIdImage();
        if (image == null || !image.startsWith("data:image/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please upload a photo of your valid ID.");
        }

        DocumentRequest request = new DocumentRequest();
        request.setReferenceNumber(newReferenceNumber());
        request.setResident(resident);
        request.setDocumentType(body.documentType());
        request.setPurpose(body.purpose().trim());
        request.setValidIdImage(image);
        requests.save(request);

        transactionLog.log(request, user, "SUBMITTED", "Submitted request for " + request.getDocumentType());
        return RequestView.from(request);
    }

    @Transactional(readOnly = true)
    public List<RequestView> myRequests(AuthUser user) {
        return requests.findByResidentIdAndDeletedByResidentFalseOrderByCreatedAtDesc(user.id())
                .stream().map(RequestView::from).toList();
    }

    /** Notification read: the resident has now seen the current status. */
    @Transactional
    public RequestView markSeen(AuthUser user, Long id) {
        DocumentRequest request = lookup.getForUser(id, user); // also checks it is the resident's own request
        request.setResidentSeenStatus(request.getStatus());
        return RequestView.from(request); // saved automatically when the transaction ends
    }

    @Transactional
    public void markAllSeen(AuthUser user) {
        requests.findByResidentIdAndDeletedByResidentFalseOrderByCreatedAtDesc(user.id())
                .forEach(r -> r.setResidentSeenStatus(r.getStatus()));
    }

    /** BR-2026-482913: year + 6 random digits, retried until unique. */
    private String newReferenceNumber() {
        String ref;
        do {
            ref = "BR-" + Year.now().getValue() + "-" + String.format("%06d", random.nextInt(1_000_000));
        } while (requests.existsByReferenceNumber(ref));
        return ref;
    }
}