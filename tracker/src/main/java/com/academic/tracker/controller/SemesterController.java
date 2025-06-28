package com.academic.tracker.controller;

import com.academic.tracker.model.Semester;
import com.academic.tracker.service.SemesterService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    @Autowired
    private SemesterService semesterService;

    @PostMapping
    public ResponseEntity<?> registerSemester(@RequestBody Semester semester,
                                              @AuthenticationPrincipal User principal) {
        Long userId = Long.parseLong(principal.getUsername());
        Semester saved = semesterService.registerSemester(semester, userId);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<?> getAllSemesters(@AuthenticationPrincipal User principal) {
        Long userId = Long.parseLong(principal.getUsername());
        return ResponseEntity.ok(semesterService.getAllSemesters(userId));
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentSemester(@AuthenticationPrincipal User principal) {
        Long userId = Long.parseLong(principal.getUsername());
        return semesterService.getCurrentSemester(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
