package com.academic.tracker.repository;

import com.academic.tracker.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    List<Semester> findByUserId(Long userId);
    Optional<Semester> findByUserIdAndNumber(Long userId, int number);
}