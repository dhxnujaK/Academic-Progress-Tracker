package com.academic.tracker.repository;

import com.academic.tracker.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {

    @Query("""
      select count(s) > 0
      from Semester s
      where s.user.id = :userId
        and (:excludeId is null or s.id <> :excludeId)
        and s.startDate <= :endDate
        and s.endDate   >= :startDate
    """)
    boolean existsOverlapping(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeId") Long excludeId
    );
    // ---- Reads ----
    /** List all semesters for a user ordered by semester number (ascending). */
    List<Semester> findByUserIdOrderByNumberAsc(Long userId);

    /** Fetch a specific semester owned by the user */
    Optional<Semester> findByIdAndUserId(Long id, Long userId);

    // ---- Uniqueness helpers (per user) ----
    /** Does a semester with this number already exist for the user? */
    boolean existsByUserIdAndNumber(Long userId, Integer number);

    /** Same as above, but excluding a specific id (useful during updates). */
    boolean existsByUserIdAndNumberAndIdNot(Long userId, Integer number, Long id);

    /** Optional name uniqueness, if you enforce unique names per user. */
    boolean existsByUserIdAndName(Long userId, String name);

    /** Name uniqueness check excluding a specific id (for updates). */
    boolean existsByUserIdAndNameAndIdNot(Long userId, String name, Long id);

    // ---- Delete (scoped by owner) ----
    long deleteByIdAndUserId(Long id, Long userId);

    // ---- Legacy keepers (avoid breaking existing callers). Marked deprecated. ----
    /** @deprecated Prefer {@link #findByUserIdOrderByNumberAsc(Long)} */
    @Deprecated
    List<Semester> findByUserId(Long userId);

    /** @deprecated Prefer {@link #existsByUserIdAndName(Long, String)} (param order normalized) */
    @Deprecated
    boolean existsByNameAndUserId(String name, Long userId);

    /** @deprecated Prefer {@link #existsByUserIdAndNumber(Long, Integer)} (boxed type) */
    @Deprecated
    Optional<Semester> findByUserIdAndNumber(Long userId, int number);
}