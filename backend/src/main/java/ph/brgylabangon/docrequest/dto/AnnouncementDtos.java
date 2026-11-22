package ph.brgylabangon.docrequest.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import ph.brgylabangon.docrequest.entity.Announcement;
import ph.brgylabangon.docrequest.entity.AnnouncementLevel;

public final class AnnouncementDtos {
    private AnnouncementDtos() {
    }

    /**
     * What staff send to post an announcement. durationHours empty or 0 = show
     * until removed.
     */
    public record AnnouncementBody(
            @NotBlank @Size(max = 120) String title,
            @NotBlank @Size(max = 2000) String message,
            @NotNull AnnouncementLevel level,
            @Min(0) @Max(720) Integer durationHours) {
    }

    /** What the browser receives. */
    public record AnnouncementView(Long id, String title, String message, AnnouncementLevel level,
            boolean active, String createdBy, LocalDateTime createdAt,
            LocalDateTime expiresAt) {
        public static AnnouncementView from(Announcement a) {
            return new AnnouncementView(a.getId(), a.getTitle(), a.getMessage(), a.getLevel(), a.isActive(),
                    a.getCreatedBy().getFullName(), a.getCreatedAt(), a.getExpiresAt());
        }
    }
}