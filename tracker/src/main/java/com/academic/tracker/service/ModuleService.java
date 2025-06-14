package com.academic.tracker.service;

import com.academic.tracker.model.Module;
import com.academic.tracker.repository.ModuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.academic.tracker.repository.UserRepository;
import com.academic.tracker.model.User;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class ModuleService {

    @Autowired
    private final ModuleRepository moduleRepo;
    @Autowired
    private UserRepository userRepository;  // ← Add this here

    public Module saveModule(Module module) {
        if (module.getUser() != null && module.getUser().getId() != null) {
            User user = userRepository.findById(module.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            module.setUser(user);  // Re-attach fully managed User entity
        } else {
            throw new RuntimeException("User ID is required in request");
        }
        return moduleRepo.save(module);
    }
    public ModuleService(ModuleRepository moduleRepo) {
        this.moduleRepo = moduleRepo;
    }


    public List<Module> getAllModules() {
        return moduleRepo.findAll();
    }

    public Module createModule(Module module) {
        if (moduleRepo.findAll().stream().anyMatch(m -> m.getModuleCode().equalsIgnoreCase(module.getModuleCode()))) {
            throw new IllegalArgumentException("A module with the same code already exists.");
        }
        return moduleRepo.save(module);
    }

    public void deleteModule(Long id) {
        moduleRepo.deleteById(id);
    }

    public Module updateModule(Long id, Module updatedModule) {
        return moduleRepo.findById(id)
                .map(existingModule -> {
                    existingModule.setModuleCode(updatedModule.getModuleCode());
                    existingModule.setModuleName(updatedModule.getModuleName());
                    existingModule.setModuleCredits(updatedModule.getModuleCredits());
                    existingModule.setModuleGrade(updatedModule.getModuleGrade());
                    existingModule.setModuleSemester(updatedModule.getModuleSemester());
                    return moduleRepo.save(existingModule);
                })
                .orElseThrow(() -> new RuntimeException("Module not found with ID: " + id));
    }

    public double calculateSgpa(Long userId, int semester) {
        List<Module> modules = moduleRepo.findByUserIdAndModuleSemester(userId, semester);

        double totalPoints = 0;
        int totalCredits = 0;

        for (Module module : modules) {
            double points = gradeToPoint(module.getModuleGrade());
            int credits = module.getModuleCredits();
            totalPoints += points * credits;
            totalCredits += credits;
        }

        return totalCredits == 0 ? 0.0 : totalPoints / totalCredits;
    }

    public double calculateCgpa(Long userId) {
        List<Module> modules = moduleRepo.findAll();

        Map<Integer, List<Module>> groupedBySemester = modules.stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .collect(Collectors.groupingBy(Module::getModuleSemester));

        double weightedSum = 0;
        double totalWeight = 0;

        for (Map.Entry<Integer, List<Module>> entry : groupedBySemester.entrySet()) {
            int semester = entry.getKey();
            double weight = (semester == 1 || semester == 2) ? 0.05 : 0.15;
            double sgpa = calculateSgpa(userId, semester);

            weightedSum += sgpa * weight;
            totalWeight += weight;
        }

        return totalWeight == 0 ? 0.0 : weightedSum / totalWeight;
    }
    private double gradeToPoint(String grade) {
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