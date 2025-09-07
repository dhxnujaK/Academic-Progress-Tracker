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

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    @Autowired
    private SemesterService semesterService;

    @PostMapping
    public ResponseEntity<?> registerSemester(@RequestBody @Valid SemesterRequest req,
                                              @AuthenticationPrincipal CustomUserDetails principal) {
        Semester saved = semesterService.registerSemester(principal.getId(), req);
        return ResponseEntity.ok(saved);
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
}
