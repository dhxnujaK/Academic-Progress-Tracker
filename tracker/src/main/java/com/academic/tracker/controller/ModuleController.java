package com.academic.tracker.controller;

import com.academic.tracker.model.Module;
import com.academic.tracker.model.User;
import com.academic.tracker.repository.UserRepository;
import com.academic.tracker.repository.ModuleRepository;
import com.academic.tracker.service.ModuleService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/modules")
public class ModuleController {

    private final ModuleRepository moduleRepo;
    private final UserRepository userRepo;
    private final ModuleService moduleService;

    public ModuleController(ModuleRepository moduleRepo, UserRepository userRepo, ModuleService moduleService) {
        this.moduleRepo = moduleRepo;
        this.userRepo = userRepo;
        this.moduleService = moduleService;
    }


    // GET all modules
    @GetMapping
    public List<Module> getAllModules() {
        return moduleService.getAllModules();
    }
    @GetMapping("/cgpa")
    public double getCgpa(@RequestParam Long userId) {
        return moduleService.calculateCgpa(userId);
    }
    @GetMapping("/sgpa")
    public double getSgpa(@RequestParam Long userId, @RequestParam int semester) {
        return moduleService.calculateSgpa(userId, semester);
    }

    // POST a new module
    @PostMapping
    public Module createModule(@RequestBody Module module) {
        return moduleService.saveModule(module);
    }

    // DELETE a module by ID
    @DeleteMapping("/{id}")
    public void deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
    }

    // PUT: Update a module by ID
    @PutMapping("/{id}")
    public Module updateModule(@PathVariable Long id, @Valid @RequestBody Module updatedModule) {
        return moduleService.updateModule(id, updatedModule);
    }
}