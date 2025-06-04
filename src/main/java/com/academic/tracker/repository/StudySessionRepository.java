package com.academic.tracker.repository;

import com.academic.tracker.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    @Query("SELECT s FROM StudySession s WHERE s.startTime BETWEEN :start AND :end")
    List<StudySession> findAllByWeek(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}