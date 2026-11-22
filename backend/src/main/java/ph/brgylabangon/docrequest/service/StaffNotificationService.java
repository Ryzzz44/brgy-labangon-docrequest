package ph.brgylabangon.docrequest.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.HistoryView;
import ph.brgylabangon.docrequest.entity.TransactionHistory;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.TransactionHistoryRepository;

/**
 * Staff notifications (UC-05 support): what residents did (submitted, updated or cancelled a request).
 * Built from the transaction_history table; X / Delete all only hide rows, the audit log is kept.
 */
@Service
public class StaffNotificationService {

    private static final String RESIDENT = "Resident";

    private final TransactionHistoryRepository history;

    public StaffNotificationService(TransactionHistoryRepository history) {
        this.history = history;
    }

    @Transactional(readOnly = true)
    public List<HistoryView> list() {
        return history.findTop100ByActorRoleAndDismissedByStaffFalseOrderByTimestampDesc(RESIDENT)
                .stream().map(HistoryView::from).toList();
    }

    /** X button on one notification. */
    @Transactional
    public void dismiss(Long id) {
        TransactionHistory row = history.findById(id)
                .filter(h -> RESIDENT.equals(h.getActorRole()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found."));
        row.setDismissedByStaff(true);
    }

    /** "Delete all" button. Returns how many were removed. */
    @Transactional
    public int dismissAll() {
        List<TransactionHistory> rows = history.findByActorRoleAndDismissedByStaffFalse(RESIDENT);
        rows.forEach(h -> h.setDismissedByStaff(true));
        return rows.size();
    }
}
