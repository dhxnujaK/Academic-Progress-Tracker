package com.academic.tracker.repository;

import com.academic.tracker.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
    List<Semester> findByUserIdOrderByNameAsc(Long userId);
}