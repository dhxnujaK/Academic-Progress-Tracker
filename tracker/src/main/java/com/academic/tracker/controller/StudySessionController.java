package com.academic.tracker.controller;

import com.academic.tracker.security.CustomUserDetails;
import com.academic.tracker.service.StudySessionService;
import com.academic.tracker.model.StudySession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    private final StudySessionService service;

    public StudySessionController(StudySessionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> record(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody Map<String, String> payload
    ) {
        Long moduleId = payload.get("moduleId") != null ? Long.valueOf(payload.get("moduleId")) : null;
        ZoneId zone = ZoneId.systemDefault();
        LocalDateTime start = payload.get("startTime") != null ? LocalDateTime.ofInstant(Instant.parse(payload.get("startTime")), zone) : null;
        LocalDateTime end = payload.get("endTime") != null ? LocalDateTime.ofInstant(Instant.parse(payload.get("endTime")), zone) : null;
        StudySession saved = service.recordSession(principal.getId(), moduleId, start, end);
        long duration = java.time.Duration.between(saved.getStartTime(), saved.getEndTime()).toSeconds();
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "durationSeconds", duration
        ));
    }

    @GetMapping("/today-summary")
    public ResponseEntity<?> todaySummary(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) Long moduleId
    ) {
        return ResponseEntity.ok(service.todaySummary(principal.getId(), moduleId));
    }

    @GetMapping("/by-day")
    public ResponseEntity<?> byDay(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam String date 
    ) {
        LocalDate d = LocalDate.parse(date);
        return ResponseEntity.ok(service.breakdownForDate(principal.getId(), d));
    }

    @GetMapping("/heatmap")
    public ResponseEntity<?> heatmap(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) String start, 
            @RequestParam(required = false) String end
    ) {
        LocalDate now = LocalDate.now();
        LocalDate startDate = (start != null) ? LocalDate.parse(start) : now.withDayOfMonth(1);
        LocalDate endDate = (end != null) ? LocalDate.parse(end) : now.withDayOfMonth(now.lengthOfMonth());
        return ResponseEntity.ok(service.heatmapTotals(principal.getId(), startDate, endDate));
    }
}
