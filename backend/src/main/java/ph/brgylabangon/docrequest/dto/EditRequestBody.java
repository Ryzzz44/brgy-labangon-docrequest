package ph.brgylabangon.docrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * New details for a pending request. validIdImage empty = keep the current ID.
 */
public record EditRequestBody(
        @NotBlank String documentType,
        @NotBlank @Size(max = 500) String purpose,
        String validIdImage) {
}