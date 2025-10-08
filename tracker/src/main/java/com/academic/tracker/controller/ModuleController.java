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
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("id", saved.getId());
        body.put("code", saved.getCode());
        body.put("name", saved.getName());
        body.put("credits", saved.getCredits());
        body.put("semesterId", saved.getSemester() != null ? saved.getSemester().getId() : null);
        body.put("grade", saved.getGrade());
        return ResponseEntity.ok(body);
    }

    @GetMapping
    public ResponseEntity<List<Module>> list(@AuthenticationPrincipal CustomUserDetails principal,
                                             @RequestParam(required = false) Long semesterId) {
        return ResponseEntity.ok(service.listModules(principal.getId(), semesterId));
    }

    @GetMapping("/current-semester")
    public ResponseEntity<List<Module>> listForCurrentSemester(
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        return ResponseEntity.ok(service.listModulesForCurrentSemester(principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Module> updateModule(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody ModuleRequest req
    ) {
        Module updated = service.updateModule(principal.getId(), id, req);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        service.deleteModule(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
