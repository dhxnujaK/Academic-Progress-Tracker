package com.academic.tracker.repository;

import com.academic.tracker.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    boolean existsByUser_IdAndCode(Long userId, String code);
    List<Module> findByUser_Id(Long userId);
    List<Module> findByUser_IdAndSemester_Id(Long userId, Long semesterId);
}