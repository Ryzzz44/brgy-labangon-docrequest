package ph.brgylabangon.docrequest.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.HistoryView;
import ph.brgylabangon.docrequest.repository.TransactionHistoryRepository;

@Service
public class ActivityService {

    private final TransactionHistoryRepository history;

    public ActivityService(TransactionHistoryRepository history) {
        this.history = history;
    }

    /** Every action on every request, newest first (the audit trail). */
    @Transactional(readOnly = true)
    public List<HistoryView> all() {
        return history.findAllByOrderByTimestampDesc().stream().map(HistoryView::from).toList();
    }
}