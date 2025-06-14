
package com.academic.tracker.service;

import com.academic.tracker.model.Semester;
import com.academic.tracker.repository.SemesterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SemesterService {

    private final SemesterRepository semesterRepository;

    public SemesterService(SemesterRepository semesterRepository) {
        this.semesterRepository = semesterRepository;
    }

    public Semester saveSemester(Semester semester) {
        return semesterRepository.save(semester);
    }

    public List<Semester> getSemestersByUserId(Long userId) {
        return semesterRepository.findByUserIdOrderByNameAsc(userId);
    }

    public void deleteSemester(Long id) {
        semesterRepository.deleteById(id);
    }

    public Semester getSemester(Long id) {
        return semesterRepository.findById(id).orElse(null);
    }
}
