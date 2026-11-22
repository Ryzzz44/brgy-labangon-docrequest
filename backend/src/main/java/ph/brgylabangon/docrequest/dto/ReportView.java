package ph.brgylabangon.docrequest.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** The transaction report for one week, month or year. */
public record ReportView(
        String period,
        LocalDate from,
        LocalDate to,
        long total,
        Map<String, Long> byStatus,
        Map<String, Long> byDocumentType,
        List<Row> requests) {

    /** One line of the report table. */
    public record Row(String referenceNumber, String residentName, String documentType,
            String status, LocalDateTime createdAt) {
    }
}