package ph.brgylabangon.docrequest.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import ph.brgylabangon.docrequest.entity.DocumentRequest;

/**
 * @EntityGraph("resident") loads the resident in the same SQL query (JOIN),
 * so RequestView.from(...) can read the resident's name without extra queries.
 */
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {

    /** A resident's own requests (not deleted), newest first. */
    @EntityGraph(attributePaths = "resident")
    List<DocumentRequest> findByResidentIdAndDeletedByResidentFalseOrderByCreatedAtDesc(Long residentId);

    /** Every request, newest first (staff dashboard and reports). */
    @EntityGraph(attributePaths = "resident")
    List<DocumentRequest> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "resident")
    Optional<DocumentRequest> findWithResidentById(Long id);

    Optional<DocumentRequest> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);
}
