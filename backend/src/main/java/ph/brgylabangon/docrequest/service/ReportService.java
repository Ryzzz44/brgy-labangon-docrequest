package ph.brgylabangon.docrequest.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.ReportView;
import ph.brgylabangon.docrequest.entity.DocumentRequest;
import ph.brgylabangon.docrequest.entity.RequestStatus;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.DocumentRequestRepository;

@Service
public class ReportService {

    private final DocumentRequestRepository requests;

    public ReportService(DocumentRequestRepository requests) {
        this.requests = requests;
    }

    /** period = "week", "month" or "year"; date = any day inside that period. */
    @Transactional(readOnly = true)
    public ReportView generate(String period, LocalDate date) {
        // 1. Work out the first and last day of the period.
        LocalDate from = switch (period) {
            case "week" -> date.with(DayOfWeek.MONDAY);
            case "month" -> date.withDayOfMonth(1);
            case "year" -> date.withDayOfYear(1);
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Period must be week, month or year.");
        };
        LocalDate to = switch (period) {
            case "week" -> from.plusDays(6);
            case "month" -> from.plusMonths(1).minusDays(1);
            default -> from.plusYears(1).minusDays(1);
        };
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        // 2. Keep only the requests filed inside the period.
        List<DocumentRequest> inPeriod = requests.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> !r.getCreatedAt().isBefore(start) && r.getCreatedAt().isBefore(end))
                .toList();

        // 3. Count them by status (every status listed, even when 0) and by document
        // type.
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (RequestStatus s : RequestStatus.values()) {
            byStatus.put(s.getLabel(), 0L);
        }
        Map<String, Long> byType = new TreeMap<>();
        for (DocumentRequest r : inPeriod) {
            byStatus.merge(r.getStatus().getLabel(), 1L, Long::sum);
            byType.merge(r.getDocumentType(), 1L, Long::sum);
        }

        // 4. The table rows.
        List<ReportView.Row> rows = inPeriod.stream()
                .map(r -> new ReportView.Row(r.getReferenceNumber(), r.getResident().getFullName(),
                        r.getDocumentType(), r.getStatus().getLabel(), r.getCreatedAt()))
                .toList();

        return new ReportView(period, from, to, inPeriod.size(), byStatus, byType, rows);
    }
}