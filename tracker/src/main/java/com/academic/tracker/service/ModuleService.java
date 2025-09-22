package com.academic.tracker.service;

import com.academic.tracker.dto.ModuleRequest;
import com.academic.tracker.model.Module;
import com.academic.tracker.model.Semester;
import com.academic.tracker.model.User;
import com.academic.tracker.repository.ModuleRepository;
import com.academic.tracker.repository.SemesterRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class ModuleService {
    private final ModuleRepository modules;
    private final SemesterRepository semesters;

    public ModuleService(ModuleRepository modules, SemesterRepository semesters) {
        this.modules = modules;
        this.semesters = semesters;
    }

    @Transactional
    public Module registerModule(Long userId, ModuleRequest req) {
        // Validate required fields early
        if (req.getCode() == null || req.getCode().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "code is required");
        }
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
        Integer credits = req.getCredits();
        if (credits == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "credits is required");
        }
        if (credits <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "credits must be a positive number");
        }

        // duplicate guard: (user, code)
        if (modules.existsByUser_IdAndCode(userId, req.getCode())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Module with code '" + req.getCode() + "' already exists for this user"
            );
        }

        Module m = new Module();
        m.setUser(new User(userId));
        m.setCode(req.getCode().trim());
        m.setName(req.getName().trim());
        m.setCredits(credits);
        if (req.getGrade() != null) {
            String g = req.getGrade().trim().toUpperCase();
            if (!g.isEmpty()) m.setGrade(g);
        }

        if (req.getSemesterId() != null) {
            Semester s = semesters.findById(req.getSemesterId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "semesterId not found"));

            
            if (!s.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "semesterId does not belong to the current user");
            }

        
            m.setSemester(s);
            m.setSemesterNumber(s.getNumber());
        }

        return modules.save(m);
    }

    public List<Module> listModules(Long userId, Long semesterId) {
        if (semesterId != null) {
            return modules.findByUser_IdAndSemester_Id(userId, semesterId);
        }
        return modules.findByUser_Id(userId);
    }

    public List<Module> listModulesForCurrentSemester(Long userId) {
        LocalDate today = LocalDate.now();
        return semesters.findByUserIdOrderByNumberAsc(userId).stream()
                .filter(sem -> sem.getStartDate() != null && sem.getEndDate() != null)
                .filter(sem -> !today.isBefore(sem.getStartDate()) && !today.isAfter(sem.getEndDate()))
                .findFirst()
                .map(sem -> modules.findByUser_IdAndSemester_IdOrderByNameAsc(userId, sem.getId()))
                .orElse(java.util.Collections.emptyList());
    }

    @Transactional
    public Module updateModule(Long userId, Long moduleId, ModuleRequest req) {
       
        Module existing = modules.findByIdAndUser_Id(moduleId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "module not found"));

        
        if (req.getCode() != null) {
            String newCode = req.getCode().trim();
            if (newCode.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "code cannot be empty");
            }
            if (modules.existsByUser_IdAndCodeAndIdNot(userId, newCode, existing.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Module code already exists for this user");
            }
            existing.setCode(newCode);
        }

        
        if (req.getName() != null) {
            String newName = req.getName().trim();
            if (newName.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name cannot be empty");
            }
            existing.setName(newName);
        }

    
        if (req.getCredits() > 0) {
            existing.setCredits(req.getCredits());
        }

        
        if (req.getSemesterId() != null) {
            Semester s = semesters.findById(req.getSemesterId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "semesterId not found"));
            if (!s.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "semesterId does not belong to the current user");
            }
            existing.setSemester(s);
            existing.setSemesterNumber(s.getNumber());
        }

        if (req.getGrade() != null) {
            String g = req.getGrade().trim().toUpperCase();
            existing.setGrade(g.isEmpty() ? null : g);
        }

        return modules.save(existing);
    }

    @Transactional
    public void deleteModule(Long userId, Long moduleId) {
        long deleted = modules.deleteByIdAndUser_Id(moduleId, userId);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "module not found");
        }
    }


}
