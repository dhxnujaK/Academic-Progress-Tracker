package com.academic.tracker.service;

import com.academic.tracker.model.Semester;
import com.academic.tracker.dto.SemesterRequest;
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

    public Semester registerSemester(Long userId, SemesterRequest req) {
        Semester semester = new Semester();
        semester.setUser(new User(userId));
        semester.setNumber(req.getNumber());
        semester.setStartDate(req.getStartDate());
        semester.setEndDate(req.getEndDate());

        String name = (req.getName() != null && !req.getName().isBlank())
                ? req.getName().trim()
                : "Semester " + req.getNumber();
        semester.setName(name);

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
