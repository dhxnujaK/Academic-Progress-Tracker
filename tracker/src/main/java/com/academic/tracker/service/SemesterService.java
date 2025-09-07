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

    /**
     * Create/register a new semester for a user with duplicate/validation checks.
     */
    @Transactional
    public Semester registerSemester(Long userId, SemesterRequest req) {
        validateDates(req.getStartDate(), req.getEndDate());

        // Prevent duplicate semester number per user
        if (req.getNumber() != null && semesterRepo.existsByUserIdAndNumber(userId, req.getNumber())) {
            throw new IllegalArgumentException("Semester number " + req.getNumber() + " already exists for this user");
        }

        // Optional: prevent duplicate name per user if a name is supplied
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

    /**
     * Update an existing semester owned by the user.
     */
    @Transactional
    public Semester updateSemester(Long userId, Long semesterId, SemesterRequest req) {
        validateDates(req.getStartDate(), req.getEndDate());

        Semester existing = semesterRepo.findByIdAndUserId(semesterId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found or not owned by user"));

        // If number changed, ensure uniqueness (exclude current id)
        if (req.getNumber() != null && !Objects.equals(req.getNumber(), existing.getNumber())) {
            if (semesterRepo.existsByUserIdAndNumberAndIdNot(userId, req.getNumber(), existing.getId())) {
                throw new IllegalArgumentException("Semester number " + req.getNumber() + " already exists for this user");
            }
            existing.setNumber(req.getNumber());
        }

        // If name provided and changed, ensure uniqueness (exclude current id)
        if (req.getName() != null && !req.getName().isBlank()) {
            String newName = req.getName().trim();
            if (!newName.equals(existing.getName()) && semesterRepo.existsByUserIdAndNameAndIdNot(userId, newName, existing.getId())) {
                throw new IllegalArgumentException("Semester name '" + newName + "' already exists for this user");
            }
            existing.setName(newName);
        }

        if (req.getStartDate() != null) existing.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) existing.setEndDate(req.getEndDate());

        return semesterRepo.save(existing);
    }

    /**
     * Delete a semester if owned by the user.
     * Guards against FK violations: refuses deletion when modules exist.
     * Returns true if deleted, false if not found.
     */
    @Transactional
    public boolean deleteSemester(Long userId, Long semesterId) {
        Optional<Semester> opt = semesterRepo.findByIdAndUserId(semesterId, userId);
        if (opt.isEmpty()) {
            return false;
        }

        // Block deletion if any modules are linked to this semester
        long moduleCount = moduleRepo.countBySemester_Id(semesterId);
        if (moduleCount > 0) {
            throw new IllegalStateException("Cannot delete semester: it has " + moduleCount + " registered module(s). Remove them first.");
        }

        // Use entity delete inside transaction rather than a derived delete query
        // to avoid 'No EntityManager with actual transaction' issues.
        Semester toDelete = opt.get();
        semesterRepo.delete(toDelete);
        return true;
    }

    @Transactional(readOnly = true)
    public List<Semester> getAllSemesters(Long userId) {
        // Return ordered by number (ascending) for consistent UI display
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

    private void validateDates(LocalDate start, LocalDate end) {
        if (start == null || end == null) return; // let DB/bean validation handle nulls if required
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }
}
