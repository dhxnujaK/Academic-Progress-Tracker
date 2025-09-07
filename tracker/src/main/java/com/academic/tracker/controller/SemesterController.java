package com.academic.tracker.controller;

import com.academic.tracker.model.Semester;
import com.academic.tracker.dto.SemesterRequest;
import jakarta.validation.Valid;
import com.academic.tracker.security.CustomUserDetails;
import com.academic.tracker.service.SemesterService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    @Autowired
    private SemesterService semesterService;

    @PostMapping
    public ResponseEntity<?> registerSemester(@RequestBody @Valid SemesterRequest req,
                                              @AuthenticationPrincipal CustomUserDetails principal) {
        try {
            Semester saved = semesterService.registerSemester(principal.getUser().getId(), req);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllSemesters(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(semesterService.getAllSemesters(principal.getUser().getId()));
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentSemester(@AuthenticationPrincipal CustomUserDetails principal) {
        return semesterService.getCurrentSemester(principal.getUser().getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/{semesterId}")
    public ResponseEntity<?> updateSemester(@PathVariable Long semesterId,
                                            @RequestBody @Valid SemesterRequest req,
                                            @AuthenticationPrincipal CustomUserDetails principal) {
        try {
            Semester updated = semesterService.updateSemester(principal.getUser().getId(), semesterId, req);
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{semesterId}")
    public ResponseEntity<?> deleteSemester(@PathVariable Long semesterId,
                                            @AuthenticationPrincipal CustomUserDetails principal) {
        try {
            semesterService.deleteSemester(principal.getUser().getId(), semesterId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("error", ex.getMessage()));
        }
    }
}
