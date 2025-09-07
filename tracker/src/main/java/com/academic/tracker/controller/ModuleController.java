package com.academic.tracker.controller;

import com.academic.tracker.dto.ModuleRequest;
import com.academic.tracker.model.Module;
import com.academic.tracker.security.CustomUserDetails;
import com.academic.tracker.service.ModuleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    private final ModuleService service;

    public ModuleController(ModuleService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> registerModule(@AuthenticationPrincipal CustomUserDetails principal,
                                            @RequestBody @Valid ModuleRequest req) {
        Module saved = service.registerModule(principal.getId(), req);
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "code", saved.getCode(),
                "name", saved.getName(),
                "credits", saved.getCredits(),
                "semesterId", saved.getSemester() != null ? saved.getSemester().getId() : null
        ));
    }

    @GetMapping
    public ResponseEntity<List<Module>> list(@AuthenticationPrincipal CustomUserDetails principal,
                                             @RequestParam(required = false) Long semesterId) {
        return ResponseEntity.ok(service.listModules(principal.getId(), semesterId));
    }
}