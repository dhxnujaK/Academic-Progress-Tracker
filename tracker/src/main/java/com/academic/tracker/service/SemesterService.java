package com.academic.tracker.service;

import com.academic.tracker.dto.SemesterRequest;
import com.academic.tracker.model.Semester;
import com.academic.tracker.model.User;
import com.academic.tracker.repository.SemesterRepository;
import com.academic.tracker.repository.ModuleRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;


@Service
public class SemesterService {

    @Autowired
    private SemesterRepository semesterRepo;

    @Autowired
    private ModuleRepository moduleRepo;

  
    @Transactional
    public Semester registerSemester(Long userId, SemesterRequest req) {
        validateDates(req.getStartDate(), req.getEndDate());

        // Ensure no time overlap with any other semester for this user
        ensureNoOverlap(userId, req.getStartDate(), req.getEndDate(), null);

        // Prevent duplicate semester number per user
        if (req.getNumber() != null && semesterRepo.existsByUserIdAndNumber(userId, req.getNumber())) {
            throw new IllegalArgumentException("Semester number " + req.getNumber() + " already exists for this user");
        }

        if (req.getName() != null && !req.getName().isBlank()) {
            String trimmed = req.getName().trim();
            if (semesterRepo.existsByUserIdAndName(userId, trimmed)) {
                throw new IllegalArgumentException("Semester name '" + trimmed + "' already exists for this user");
            }
        }

        Semester semester = new Semester();
        semester.setUser(new User(userId));
        semester.setNumber(req.getNumber());
        semester.setStartDate(req.getStartDate());
        semester.setEndDate(req.getEndDate());

        String name = (req.getName() != null && !req.getName().isBlank())
                ? req.getName().trim()
                : ("Semester " + req.getNumber());
        semester.setName(name);

        return semesterRepo.save(semester);
    }

    
    @Transactional
    public Semester updateSemester(Long userId, Long semesterId, SemesterRequest req) {
        

        Semester existing = semesterRepo.findByIdAndUserId(semesterId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found or not owned by user"));

        
        LocalDate effectiveStart = (req.getStartDate() != null) ? req.getStartDate() : existing.getStartDate();
        LocalDate effectiveEnd   = (req.getEndDate() != null) ? req.getEndDate()   : existing.getEndDate();
        validateDates(effectiveStart, effectiveEnd);
        ensureNoOverlap(userId, effectiveStart, effectiveEnd, existing.getId());

        
        boolean numberChanged = req.getNumber() != null && !Objects.equals(req.getNumber(), existing.getNumber());
        if (numberChanged) {
            if (semesterRepo.existsByUserIdAndNumberAndIdNot(userId, req.getNumber(), existing.getId())) {
                throw new IllegalArgumentException("Semester number " + req.getNumber() + " already exists for this user");
            }
            existing.setNumber(req.getNumber());
        }

        if (req.getName() != null && !req.getName().isBlank()) {
            String newName = req.getName().trim();
            if (!newName.equals(existing.getName()) && semesterRepo.existsByUserIdAndNameAndIdNot(userId, newName, existing.getId())) {
                throw new IllegalArgumentException("Semester name '" + newName + "' already exists for this user");
            }
            existing.setName(newName);
        } else if (numberChanged) {
            String currentName = existing.getName();
            if (currentName == null || currentName.matches("^Semester\\s+\\d+$")) {
                existing.setName("Semester " + req.getNumber());
            }
        }

        if (req.getStartDate() != null) existing.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) existing.setEndDate(req.getEndDate());

        Semester saved = semesterRepo.save(existing);

        if (numberChanged) {
            moduleRepo.updateSemesterNumberForSemester(saved.getId(), saved.getNumber());
        }

        return saved;
    }

  
    @Transactional
    public boolean deleteSemester(Long userId, Long semesterId) {
        Optional<Semester> opt = semesterRepo.findByIdAndUserId(semesterId, userId);
        if (opt.isEmpty()) {
            return false;
        }

        long moduleCount = moduleRepo.countBySemester_Id(semesterId);
        if (moduleCount > 0) {
            throw new IllegalStateException("Cannot delete semester: it has " + moduleCount + " registered module(s). Remove them first.");
        }

        Semester toDelete = opt.get();
        semesterRepo.delete(toDelete);
        return true;
    }

    @Transactional(readOnly = true)
    public List<Semester> getAllSemesters(Long userId) {
        return semesterRepo.findByUserIdOrderByNumberAsc(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Semester> getCurrentSemester(Long userId) {
        LocalDate today = LocalDate.now();
        return semesterRepo.findByUserIdOrderByNumberAsc(userId).stream()
                .filter(sem -> sem.getStartDate() != null && sem.getEndDate() != null)
                .filter(sem -> !today.isBefore(sem.getStartDate()) && !today.isAfter(sem.getEndDate()))
                .findFirst();
    }


    private boolean overlaps(LocalDate aStart, LocalDate aEnd, LocalDate bStart, LocalDate bEnd) {
        if (aStart == null || aEnd == null || bStart == null || bEnd == null) return false;
        return !(aEnd.isBefore(bStart) || bEnd.isBefore(aStart));
    }

    private void ensureNoOverlap(Long userId, LocalDate start, LocalDate end, Long excludeId) {
        if (start == null || end == null) return; // let bean validation handle null if required
        List<Semester> semesters = semesterRepo.findByUserIdOrderByNumberAsc(userId);
        for (Semester s : semesters) {
            if (excludeId != null && Objects.equals(s.getId(), excludeId)) continue;
            if (s.getStartDate() == null || s.getEndDate() == null) continue;
            if (overlaps(start, end, s.getStartDate(), s.getEndDate())) {
                String name = (s.getName() != null) ? s.getName() : ("Semester " + s.getNumber());
                throw new IllegalArgumentException(
                        "Semester period overlaps with existing " + name +
                        " (" + s.getStartDate() + " to " + s.getEndDate() + ")");
            }
        }
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start == null || end == null) return; // let DB/bean validation handle nulls if required
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }
}
