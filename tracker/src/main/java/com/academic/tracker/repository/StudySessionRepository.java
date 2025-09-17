package com.academic.tracker.repository;

import com.academic.tracker.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    // Sum of all modules for user on a given day (seconds)
    @Query(value = "SELECT COALESCE(SUM(TIMESTAMPDIFF(SECOND, s.start_time, s.end_time)),0)\n" +
            "FROM study_session s\n" +
            "WHERE s.user_id = :userId\n" +
            "  AND s.start_time >= :start\n" +
            "  AND s.end_time   <= :end", nativeQuery = true)
    long sumAllByUserAndDaySeconds(@Param("userId") Long userId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    // Sum for a single module (seconds)
    @Query(value = "SELECT COALESCE(SUM(TIMESTAMPDIFF(SECOND, s.start_time, s.end_time)),0)\n" +
            "FROM study_session s\n" +
            "WHERE s.user_id = :userId\n" +
            "  AND s.module_id = :moduleId\n" +
            "  AND s.start_time >= :start\n" +
            "  AND s.end_time   <= :end", nativeQuery = true)
    long sumByUserModuleAndDaySeconds(@Param("userId") Long userId,
                                      @Param("moduleId") Long moduleId,
                                      @Param("start") LocalDateTime start,
                                      @Param("end") LocalDateTime end);

    // Per-module totals for a single day (seconds), including module code and name
    @Query(value = "SELECT m.id, m.code, m.name, COALESCE(SUM(TIMESTAMPDIFF(SECOND, s.start_time, s.end_time)),0) AS seconds\n" +
            "FROM study_session s\n" +
            "JOIN module m ON m.id = s.module_id\n" +
            "WHERE s.user_id = :userId AND s.start_time >= :start AND s.end_time <= :end\n" +
            "GROUP BY m.id, m.code, m.name\n" +
            "ORDER BY m.name ASC", nativeQuery = true)
    java.util.List<Object[]> totalsByUserAndDay(@Param("userId") Long userId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

    // Heatmap totals grouped by date within a range (seconds)
    @Query(value = "SELECT DATE(s.start_time) AS d, COALESCE(SUM(TIMESTAMPDIFF(SECOND, s.start_time, s.end_time)),0) AS seconds\n" +
            "FROM study_session s\n" +
            "WHERE s.user_id = :userId AND s.start_time >= :start AND s.end_time <= :end\n" +
            "GROUP BY d", nativeQuery = true)
    java.util.List<Object[]> dailyTotalsInRange(@Param("userId") Long userId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);
}
