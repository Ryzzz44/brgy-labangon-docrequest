package ph.brgylabangon.docrequest.service;

import org.springframework.stereotype.Service;
import ph.brgylabangon.docrequest.entity.DocumentRequest;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.DocumentRequestRepository;
import ph.brgylabangon.docrequest.security.AuthUser;

/**
 * Shared helper: load a request and make sure the caller may touch it.
 * A resident may only access their own requests; staff may access any request.
 */
@Service
public class RequestLookupService {

    private final DocumentRequestRepository repository;

    public RequestLookupService(DocumentRequestRepository repository) {
        this.repository = repository;
    }

    public DocumentRequest getForUser(Long requestId, AuthUser user) {
        DocumentRequest r = repository.findWithResidentById(requestId)
                .orElseThrow(() -> ApiException.notFound("Request"));
        if (!user.isStaff() && (!r.getResident().getId().equals(user.id()) || r.isDeletedByResident())) {
            // Same answer as "not found" so residents cannot discover other people's requests.
            throw ApiException.notFound("Request");
        }
        return r;
    }
}
