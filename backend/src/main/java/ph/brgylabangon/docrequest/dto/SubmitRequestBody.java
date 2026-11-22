package ph.brgylabangon.docrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubmitRequestBody(
        @NotBlank String documentType,
        @NotBlank @Size(max = 500) String purpose,
        String validIdImage) {
}