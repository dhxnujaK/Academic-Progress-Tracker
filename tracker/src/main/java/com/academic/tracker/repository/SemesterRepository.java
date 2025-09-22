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
  
    List<Semester> findByUserIdOrderByNumberAsc(Long userId);

  
    Optional<Semester> findByIdAndUserId(Long id, Long userId);

 
    boolean existsByUserIdAndNumber(Long userId, Integer number);

    boolean existsByUserIdAndNumberAndIdNot(Long userId, Integer number, Long id);

    boolean existsByUserIdAndName(Long userId, String name);

    boolean existsByUserIdAndNameAndIdNot(Long userId, String name, Long id);

    long deleteByIdAndUserId(Long id, Long userId);

    @Deprecated
    List<Semester> findByUserId(Long userId);

 
    @Deprecated
    boolean existsByNameAndUserId(String name, Long userId);
    
    @Deprecated
    Optional<Semester> findByUserIdAndNumber(Long userId, int number);
}