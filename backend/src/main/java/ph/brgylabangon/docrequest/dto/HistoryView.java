package ph.brgylabangon.docrequest.dto;

import java.time.LocalDateTime;
import ph.brgylabangon.docrequest.entity.TransactionHistory;

/** One row of the activity log. */
public record HistoryView(Long id, Long requestId, String referenceNumber, String actorName,
        String actorRole, String actionType, String remarks, LocalDateTime timestamp) {

    public static HistoryView from(TransactionHistory h) {
        return new HistoryView(h.getId(), h.getRequest().getId(), h.getRequest().getReferenceNumber(),
                h.getActorName(), h.getActorRole(), h.getActionType(), h.getRemarks(), h.getTimestamp());
    }
}