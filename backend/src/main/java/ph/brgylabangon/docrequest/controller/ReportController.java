package ph.brgylabangon.docrequest.controller;

import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ph.brgylabangon.docrequest.dto.ReportView;
import ph.brgylabangon.docrequest.service.ReportService;

/** GET /api/staff/reports?period=month&date=2026-11-22 (staff only). */
@RestController
@RequestMapping("/api/staff/reports")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping
    public ReportView report(@RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.generate(period, date != null ? date : LocalDate.now());
    }
}