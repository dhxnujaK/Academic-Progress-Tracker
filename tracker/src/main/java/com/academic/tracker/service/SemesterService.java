package com.academic.tracker.service;

import com.academic.tracker.model.Semester;
import com.academic.tracker.model.User;
import com.academic.tracker.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SemesterService {

    @Autowired
    private SemesterRepository semesterRepo;

    public Semester registerSemester(Semester semester, Long userId) {
        semester.setUser(new User(userId));
        return semesterRepo.save(semester);
    }

    public List<Semester> getAllSemesters(Long userId) {
        return semesterRepo.findByUserId(userId);
    }

    public Optional<Semester> getCurrentSemester(Long userId) {
        LocalDate today = LocalDate.now();
        return semesterRepo.findByUserId(userId).stream()
                .filter(s -> !today.isBefore(s.getStartDate()) && !today.isAfter(s.getEndDate()))
                .findFirst();
    }
}
