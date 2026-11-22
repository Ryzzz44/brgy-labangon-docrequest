package ph.brgylabangon.docrequest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ph.brgylabangon.docrequest.entity.RequestStatus;

/**
 * What staff send to change a request's status. reason is required only when
 * rejecting.
 */
public record StatusUpdateBody(
        @NotNull RequestStatus status,
        @Size(max = 500) String reason) {
}