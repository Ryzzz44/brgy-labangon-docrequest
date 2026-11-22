package ph.brgylabangon.docrequest.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ph.brgylabangon.docrequest.entity.Resident;

/** Spring Data writes the SQL for these methods from their names. */
public interface ResidentRepository extends JpaRepository<Resident, Long> {
    Optional<Resident> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
