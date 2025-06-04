package com.academic.tracker.service;

import com.academic.tracker.model.Module;
import com.academic.tracker.repository.ModuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GpaService {

    private final ModuleRepository moduleRepo;

    public GpaService(ModuleRepository moduleRepo) {
        this.moduleRepo = moduleRepo;
    }

    public double calculateSgpa(int semester) {
        List<Module> modules = moduleRepo.findAll();

        double totalPoints = 0;
        int totalCredits = 0;

        for (Module m : modules) {
            if (m.getModuleSemester() == semester) {
                double gradePoint = convertGradeToPoint(m.getModuleGrade());
                totalPoints += gradePoint * m.getModuleCredits();
                totalCredits += m.getModuleCredits();
            }
        }

        if (totalCredits == 0) return 0.0;

        return totalPoints / totalCredits;
    }

    private double convertGradeToPoint(String grade) {
        return switch (grade.toUpperCase()) {
            case "A+", "A" -> 4.0;
            case "A-" -> 3.7;
            case "B+" -> 3.3;
            case "B"  -> 3.0;
            case "B-" -> 2.7;
            case "C+" -> 2.3;
            case "C"  -> 2.0;
            case "C-" -> 1.7;
            case "D"  -> 1.0;
            default   -> 0.0;
        };
    }
}