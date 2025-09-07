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

import java.util.List;

@Service
public class ModuleService {
    private final ModuleRepository modules;
    private final SemesterRepository semesters;

    public ModuleService(ModuleRepository modules, SemesterRepository semesters) {
        this.modules = modules;
        this.semesters = semesters;
    }

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

        if (req.getSemesterId() != null) {
            Semester s = semesters.findById(req.getSemesterId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "semesterId not found"));

            // optional safety: ensure semester belongs to same user
            if (!s.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "semesterId does not belong to the current user");
            }

            // Set both the relation and the denormalized semester number column
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
}