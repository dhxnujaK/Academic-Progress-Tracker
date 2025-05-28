package com.academic.tracker.service;

import com.academic.tracker.model.Module;
import com.academic.tracker.repository.ModuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepo;

    public ModuleService(ModuleRepository moduleRepo) {
        this.moduleRepo = moduleRepo;
    }

    public List<Module> getAllModules() {
        return moduleRepo.findAll();
    }

    public Module createModule(Module module) {
        return moduleRepo.save(module);
    }

    public void deleteModule(Long id) {
        moduleRepo.deleteById(id);
    }
}