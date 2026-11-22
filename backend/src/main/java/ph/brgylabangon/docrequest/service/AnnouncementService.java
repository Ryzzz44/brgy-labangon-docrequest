package ph.brgylabangon.docrequest.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.AnnouncementDtos.AnnouncementBody;
import ph.brgylabangon.docrequest.dto.AnnouncementDtos.AnnouncementView;
import ph.brgylabangon.docrequest.entity.Announcement;
import ph.brgylabangon.docrequest.entity.Staff;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.AnnouncementRepository;
import ph.brgylabangon.docrequest.repository.StaffRepository;
import ph.brgylabangon.docrequest.security.AuthUser;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcements;
    private final StaffRepository staffRepository;

    public AnnouncementService(AnnouncementRepository announcements, StaffRepository staffRepository) {
        this.announcements = announcements;
        this.staffRepository = staffRepository;
    }

    /** For residents: active announcements that have not expired yet. */
    @Transactional(readOnly = true)
    public List<AnnouncementView> active() {
        LocalDateTime now = LocalDateTime.now();
        return announcements.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(a -> a.getExpiresAt() == null || a.getExpiresAt().isAfter(now))
                .map(AnnouncementView::from)
                .toList();
    }

    /** For staff: every announcement, including ended ones. */
    @Transactional(readOnly = true)
    public List<AnnouncementView> all() {
        return announcements.findAllByOrderByCreatedAtDesc().stream().map(AnnouncementView::from).toList();
    }

    @Transactional
    public AnnouncementView post(AuthUser user, AnnouncementBody body) {
        Staff staff = staffRepository.findById(user.id()).orElseThrow(() -> ApiException.notFound("Staff"));
        Announcement a = new Announcement();
        a.setTitle(body.title().trim());
        a.setMessage(body.message().trim());
        a.setLevel(body.level());
        a.setCreatedBy(staff);
        if (body.durationHours() != null && body.durationHours() > 0) {
            a.setExpiresAt(LocalDateTime.now().plusHours(body.durationHours()));
        }
        return AnnouncementView.from(announcements.save(a));
    }

    /** Ends an announcement early; it stays in the list for records. */
    @Transactional
    public AnnouncementView deactivate(Long id) {
        Announcement a = announcements.findById(id).orElseThrow(() -> ApiException.notFound("Announcement"));
        a.setActive(false);
        return AnnouncementView.from(a);
    }

    @Transactional
    public void delete(Long id) {
        if (!announcements.existsById(id))
            throw ApiException.notFound("Announcement");
        announcements.deleteById(id);
    }
}