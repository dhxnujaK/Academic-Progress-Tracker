package com.academic.tracker.repository;

import com.academic.tracker.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    boolean existsByUser_IdAndCode(Long userId, String code);
    List<Module> findByUser_Id(Long userId);
    List<Module> findByUser_IdAndSemester_Id(Long userId, Long semesterId);
    Optional<Module> findByIdAndUser_Id(Long id, Long userId);
    @Modifying
    @Transactional
    long deleteByIdAndUser_Id(Long id, Long userId);
    boolean existsByIdAndUser_Id(Long id, Long userId);
    boolean existsByUser_IdAndCodeAndIdNot(Long userId, String code, Long excludeId);
    List<Module> findByUser_IdAndSemester_IdOrderByNameAsc(Long userId, Long semesterId);
    long countBySemester_Id(Long semesterId);

    List<Module> findByUser_IdAndSemesterIsNullOrderByNameAsc(Long userId);

 
    @Modifying
    @Transactional
    @org.springframework.data.jpa.repository.Query("update Module m set m.semesterNumber = :newNumber where m.semester.id = :semesterId")
    int updateSemesterNumberForSemester(@org.springframework.data.repository.query.Param("semesterId") Long semesterId,
                                        @org.springframework.data.repository.query.Param("newNumber") Integer newNumber);
}
