package ph.brgylabangon.docrequest.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ph.brgylabangon.docrequest.entity.Announcement;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
