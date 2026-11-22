package ph.brgylabangon.docrequest.dto;

import java.time.LocalDateTime;
import ph.brgylabangon.docrequest.entity.DocumentRequest;
import ph.brgylabangon.docrequest.entity.RequestStatus;

/**
 * Shared JSON shape of a document request, used by every feature (resident and staff).
 * Load requests with the repository methods marked @EntityGraph so the resident is already loaded.
 * Built from the entity so we never send the whole Resident object (with password hash) to the browser.
 */
public record RequestView(
        Long id,
        String referenceNumber,
        String documentType,
        String purpose,
        RequestStatus status,
        String rejectionReason,
        RequestStatus residentSeenStatus,
        boolean seenByStaff,
        boolean archivedByResident,
        String validIdImage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long residentId,
        String residentName,
        String residentContactNumber,
        String residentAddress,
        RequestStatus notifClearedStatus) {

    public static RequestView from(DocumentRequest r) {
        var res = r.getResident();
        return new RequestView(r.getId(), r.getReferenceNumber(), r.getDocumentType(), r.getPurpose(),
                r.getStatus(), r.getRejectionReason(), r.getResidentSeenStatus(), r.isSeenByStaff(),
                r.isArchivedByResident(), r.getValidIdImage(), r.getCreatedAt(), r.getUpdatedAt(),
                res.getId(), res.getFullName(), res.getContactNumber(), res.getAddress(),
                r.getNotifClearedStatus());
    }
}
