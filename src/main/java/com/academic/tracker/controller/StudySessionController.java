package com.academic.tracker.controller;

import com.academic.tracker.model.StudySession;
import com.academic.tracker.service.StudySessionService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/study-sessions")
public class StudySessionController {

    private final StudySessionService studySessionService;

    public StudySessionController(StudySessionService studySessionService) {
        this.studySessionService = studySessionService;
    }

    // Get all study sessions
    @GetMapping
    public List<StudySession> getAllSessions() {
        return studySessionService.getAllSessions();
    }

    // Create a new session
    @PostMapping
    public StudySession saveSession(@RequestBody StudySession session) {
        return studySessionService.saveSession(session);
    }

    // Delete a session by ID
    @DeleteMapping("/{id}")
    public void deleteSession(@PathVariable Long id) {
        studySessionService.deleteSession(id);
    }

    // Get weekly report
    @GetMapping("/weekly")
    public List<StudySession> getWeeklySessions(@RequestParam String weekStartDate) {
        LocalDate startDate = LocalDate.parse(weekStartDate); // e.g. "2025-05-26"
        return studySessionService.getWeeklySessions(startDate);
    }
}