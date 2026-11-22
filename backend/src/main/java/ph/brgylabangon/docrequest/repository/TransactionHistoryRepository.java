package ph.brgylabangon.docrequest.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ph.brgylabangon.docrequest.entity.TransactionHistory;

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    List<TransactionHistory> findByRequestIdOrderByTimestampDesc(Long requestId);
    List<TransactionHistory> findAllByOrderByTimestampDesc();
}
