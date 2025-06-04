package com.academic.tracker.repository;

import com.academic.tracker.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByUserIdAndModuleSemester(Long userId, int moduleSemester);
}
