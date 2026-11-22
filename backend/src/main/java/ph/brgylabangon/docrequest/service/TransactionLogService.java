package ph.brgylabangon.docrequest.service;

import org.springframework.stereotype.Service;
import ph.brgylabangon.docrequest.entity.DocumentRequest;
import ph.brgylabangon.docrequest.entity.TransactionHistory;
import ph.brgylabangon.docrequest.repository.TransactionHistoryRepository;
import ph.brgylabangon.docrequest.security.AuthUser;

/**
 * Shared by every feature: call log(...) whenever a request is created or changed,
 * so the transaction_history table keeps a full audit trail.
 * Example: transactionLog.log(request, user, "SUBMITTED", "Submitted request for Barangay Clearance");
 */
@Service
public class TransactionLogService {

    private final TransactionHistoryRepository repository;

    public TransactionLogService(TransactionHistoryRepository repository) {
        this.repository = repository;
    }

    public void log(DocumentRequest request, AuthUser actor, String actionType, String remarks) {
        TransactionHistory h = new TransactionHistory();
        h.setRequest(request);
        h.setActorName(actor.name());
        h.setActorRole(actor.isStaff() ? "Staff" : "Resident");
        h.setActionType(actionType);
        h.setRemarks(remarks);
        repository.save(h);
    }
}
