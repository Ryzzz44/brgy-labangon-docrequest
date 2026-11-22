package ph.brgylabangon.docrequest.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ph.brgylabangon.docrequest.entity.Staff;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmailIgnoreCase(String email);
}
