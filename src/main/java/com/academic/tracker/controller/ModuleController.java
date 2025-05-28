package com.academic.tracker.controller;

import com.academic.tracker.model.Module;
import com.academic.tracker.service.ModuleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/modules")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    // GET all modules
    @GetMapping
    public List<Module> getAllModules() {
        return moduleService.getAllModules();
    }

    // POST a new module
    @PostMapping
    public Module createModule(@RequestBody Module module) {
        return moduleService.createModule(module);
    }

    // DELETE a module by ID
    @DeleteMapping("/{id}")
    public void deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
    }
}