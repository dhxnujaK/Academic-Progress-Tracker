package com.academic.tracker.service;

import com.academic.tracker.model.StudySession;
import com.academic.tracker.repository.StudySessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StudySessionService {

    private final StudySessionRepository studySessionRepo;

    public StudySessionService(StudySessionRepository studySessionRepo) {
        this.studySessionRepo = studySessionRepo;
    }

    public List<StudySession> getWeeklySessions(LocalDate weekStartDate) {
        LocalDateTime start = weekStartDate.atStartOfDay();
        LocalDateTime end = start.plusDays(7);
        return studySessionRepo.findAllByWeek(start, end);
    }

    public StudySession saveSession(StudySession session) {
        return studySessionRepo.save(session);
    }

    public void deleteSession(Long id) {
        studySessionRepo.deleteById(id);
    }

    public List<StudySession> getAllSessions() {
        return studySessionRepo.findAll();
    }
}